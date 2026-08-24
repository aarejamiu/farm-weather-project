const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

router.post('/initialize', authMiddleware, isCustomer, initializePayment);
router.post('/verify', authMiddleware, isCustomer, verifyPayment);

module.exports = router;