const axios = require('axios');
const Payment = require('../models/payment');
const Product = require('../models/product');
const User = require('../models/user');
const { createOrderFromPayment } = require('./orderController');

const paystackHeaders = () => ({
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
});

const initializePayment = async (req, res) => {
    const { items, deliveryAddress } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'No items in payment' });
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ message: 'Payment service is not configured' });

    try {
        const user = await User.findById(req.user.id);
        let amount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            const quantity = Number(item.quantity);
            if (!product || !product.available) return res.status(400).json({ message: 'A product is no longer available' });
            if (!Number.isInteger(quantity) || quantity < 1 || product.quantity < quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            amount += product.price * quantity;
            validatedItems.push({ productId: product._id, quantity });
        }

        const callbackUrl = `${req.body.callbackUrl || ''}`;
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: user.email,
            amount: Math.round(amount * 100),
            callback_url: callbackUrl || undefined
        }, { headers: paystackHeaders() });

        const reference = response.data.data.reference;
        await Payment.create({
            customer: user._id,
            items: validatedItems,
            amount,
            deliveryAddress: deliveryAddress || '',
            reference
        });

        res.json({ authorizationUrl: response.data.data.authorization_url, reference });
    } catch (error) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Unable to initialize payment' });
    }
};

const verifyPayment = async (req, res) => {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'Payment reference is required' });
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ message: 'Payment service is not configured' });

    try {
        const payment = await Payment.findOne({ reference, customer: req.user.id });
        if (!payment) return res.status(404).json({ message: 'Payment session not found' });
        if (payment.status === 'paid') return res.json({ message: 'Payment already verified' });

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: paystackHeaders() });
        const transaction = response.data.data;
        if (transaction.status !== 'success' || Number(transaction.amount) !== Math.round(payment.amount * 100)) {
            payment.status = 'failed';
            await payment.save();
            return res.status(400).json({ message: 'Payment was not successful' });
        }

        const order = await createOrderFromPayment(payment);
        payment.status = 'paid';
        await payment.save();
        res.json({ message: 'Payment verified and order created', order });
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Unable to verify payment' });
    }
};

module.exports = { initializePayment, verifyPayment };