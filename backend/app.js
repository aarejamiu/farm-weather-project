const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// Also accept the origin derived from FRONTEND_URL (password-reset / site URL).
const frontendUrlOrigin = (() => {
    try {
        return process.env.FRONTEND_URL ? new URL(process.env.FRONTEND_URL).origin : null;
    } catch {
        return null;
    }
})();
if (frontendUrlOrigin && !allowedOrigins.includes(frontendUrlOrigin)) {
    allowedOrigins.push(frontendUrlOrigin);
}

const isLocalDevOrigin = (origin) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (isLocalDevOrigin(origin)) return true;
    // Optional: allow any subdomain of a listed base, e.g. https://*.github.io
    return allowedOrigins.some((allowed) => {
        if (!allowed.includes('*')) return false;
        const pattern = allowed
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i').test(origin);
    });
};

const authRoutes        = require('./routes/authroute');
const weatherRoutes     = require('./routes/weatherRoutes');
const dateRoutes        = require('./routes/dateRoutes');
const profileRoutes     = require('./routes/profileRoutes');
const productRoutes     = require('./routes/productRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const cartRoutes        = require('./routes/cartRoutes');
const messageRoutes     = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const taskRoutes        = require('./routes/taskRoutes');

app.use(cors({
    origin: (requestOrigin, callback) => {
        // Never throw — a thrown error becomes a browser "Failed to fetch"
        // which the login page shows as "Unable to connect to server."
        if (isAllowedOrigin(requestOrigin)) {
            return callback(null, true);
        }
        console.warn(`CORS blocked origin: ${requestOrigin}`);
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Cheap wake-up / connectivity check for mobile clients (Render cold starts).
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth',          authRoutes);
app.use('/api/weather',       weatherRoutes);
app.use('/api/dates',         dateRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/cart',          cartRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks',     taskRoutes);

module.exports = app;
