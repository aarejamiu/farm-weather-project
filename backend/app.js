const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

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
        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

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