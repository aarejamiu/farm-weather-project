const Cart = require('../models/cart');
const Product = require('../models/product');

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user.id })
            .populate('items.product', 'name price image available quantity');
        if (!cart) return res.json({ items: [], total: 0 });

        const total = cart.items.reduce((sum, item) => {
            return sum + (item.product?.price || 0) * item.quantity;
        }, 0);

        res.json({ items: cart.items, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    try {
        const product = await Product.findById(productId);
        if (!product || !product.available) {
            return res.status(404).json({ message: 'Product not available' });
        }

        let cart = await Cart.findOne({ customer: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                customer: req.user.id,
                items: [{ product: productId, quantity }]
            });
        } else {
            const existing = cart.items.find(i => i.product.toString() === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            await cart.save();
        }

        res.json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ message: 'Item not in cart' });

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.product.toString() !== productId);
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        res.json({ message: 'Cart updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ customer: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(i => i.product.toString() !== productId);
        await cart.save();

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { customer: req.user.id },
            { items: [] }
        );
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };