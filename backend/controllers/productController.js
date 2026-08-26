const Product = require('../models/product');

const createProduct = async (req, res) => {
    const { name, description, price, quantity, category, unit, image, available, lowStockThreshold } = req.body;

    if (!name || !price || quantity === undefined) {
        return res.status(400).json({ message: 'Name, price, and quantity are required' });
    }

    try {
        const product = await Product.create({
            name, description, price, quantity, unit,
            category, image, available, lowStockThreshold
        });
        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = { available: true, quantity: { $gt: 0 } };

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { returnDocument: 'after', runValidators: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleAvailability = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        product.available = !product.available;
        await product.save();
        res.json({ message: `Product marked ${product.available ? 'available' : 'unavailable'}`, product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getPublicProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleAvailability
};