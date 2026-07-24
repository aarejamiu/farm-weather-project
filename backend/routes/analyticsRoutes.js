const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlySales, getTopProducts } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFarmer } = require('../middleware/roleMiddleware');

router.get('/stats',        authMiddleware, isFarmer, getDashboardStats);
router.get('/monthly',      authMiddleware, isFarmer, getMonthlySales);
router.get('/top-products', authMiddleware, isFarmer, getTopProducts);

module.exports = router;