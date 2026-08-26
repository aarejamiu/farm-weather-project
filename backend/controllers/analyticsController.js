const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            ordersToday,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders,
            allOrders
        ] = await Promise.all([
            Order.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: today } }),
            Order.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Product.countDocuments(),
            Order.find().populate('customer', 'username email').sort({ createdAt: -1 }).limit(5),
            Order.find({ paymentStatus: 'paid' })
        ]);

        const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyOrders = await Order.find({
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
        });
        const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);

        const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const currentCustomers = new Set(monthlyOrders.map(order => order.customer.toString()));
        const previousCustomers = await Order.find({
            paymentStatus: 'paid',
            createdAt: { $gte: startOfPreviousMonth, $lt: startOfMonth }
        }).distinct('customer');
        const retainedCustomers = [...currentCustomers].filter(id => previousCustomers.some(previousId => previousId.toString() === id)).length;
        const retentionRate = previousCustomers.length ? Math.round((retainedCustomers / previousCustomers.length) * 100) : 0;

        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        }).select('name quantity lowStockThreshold');

        res.json({
            ordersToday,
            totalOrders,
            totalCustomers,
            totalProducts,
            totalRevenue,
            monthlyRevenue,
            retentionRate,
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlySales = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const data = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lt: new Date(`${year + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const months = Array.from({ length: 12 }, (_, i) => {
            const found = data.find(d => d._id === i + 1);
            return {
                month: i + 1,
                revenue: found?.revenue || 0,
                orders: found?.orders || 0
            };
        });

        res.json(months);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getMonthlySales, getTopProducts };