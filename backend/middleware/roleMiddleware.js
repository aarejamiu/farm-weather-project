const isFarmer = (req, res, next) => {
    if (req.user?.role !== 'farmer') {
        return res.status(403).json({ message: 'Access denied. Farmers only.' });
    }
    next();
};

const isCustomer = (req, res, next) => {
    if (req.user?.role !== 'customer') {
        return res.status(403).json({ message: 'Access denied. Customers only.' });
    }
    next();
};

module.exports = { isFarmer, isCustomer };