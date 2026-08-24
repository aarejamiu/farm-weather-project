const Order = require('../models/order');
const Product = require('../models/product');
const Notification = require('../models/notification');

const createOrderFromPayment = async (payment) => {
    let total = 0;
    const enrichedItems = [];

    for (const item of payment.items) {
        const product = await Product.findById(item.productId);
        if (!product || !product.available) throw new Error('A product is no longer available');
        if (product.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        product.quantity -= item.quantity;
        await product.save();
        total += product.price * item.quantity;
        enrichedItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
    }

    const order = await Order.create({
        customer: payment.customer,
        items: enrichedItems,
        total,
        deliveryAddress: payment.deliveryAddress,
        receiptId: 'RCP-' + Date.now(),
        status: 'paid',
        paymentStatus: 'paid',
        paymentRef: payment.reference
    });

    await Notification.create({
        user: payment.customer,
        message: `New order #${order.receiptId} placed for ₦${total}`,
        type: 'order'
    });
    return order;
};

const placeOrder = async (req, res) => {
    const { items, deliveryAddress, note } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in order' });
    }

    try {
        let total = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
            if (!product.available) return res.status(400).json({ message: `${product.name} is not available` });
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            product.quantity -= item.quantity;
            await product.save();

            const lineTotal = product.price * item.quantity;
            total += lineTotal;

            enrichedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
        }

        const receiptId = 'RCP-' + Date.now();

        const order = await Order.create({
            customer: req.user.id,
            items: enrichedItems,
            total,
            deliveryAddress,
            note,
            receiptId
        });

        await Notification.create({
            user: req.user.id,
            message: `New order #${receiptId} placed for ₦${total}`,
            type: 'order'
        });

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
            .populate('customer', 'username email phone')
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'ready_for_pickup', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'paid') order.paymentStatus = 'paid';
        await order.save();

        await Notification.create({
            user: order.customer,
            message: `Your order #${order.receiptId} is now ${status.replace('_', ' ')}`,
            type: 'order'
        });

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'username email phone')
            .populate('items.product', 'name image');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    placeOrder,
    createOrderFromPayment,
    getCustomerOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderById
};