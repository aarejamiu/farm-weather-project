const jwt= require('jsonwebtoken');

const getCookie = (req, name) => (req.headers.cookie || '')
    .split(';')
    .map(value => value.trim().split('='))
    .find(([key]) => key === name)?.[1];

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = getCookie(req, 'accessToken') || bearerToken;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();

    } catch (error) {
        console.error(error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;