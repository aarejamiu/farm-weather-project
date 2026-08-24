const express = require('express');
const router = express.Router();
const {
    getCustomerOrders,
    getAllOrders,
    updateOrderStatus,
    getOrderById
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFarmer, isCustomer } = require('../middleware/roleMiddleware');

router.get('/my',               authMiddleware, isCustomer, getCustomerOrders);
router.get('/',                 authMiddleware, isFarmer,   getAllOrders);
router.get('/:id',              authMiddleware,             getOrderById);
router.put('/:id/status',       authMiddleware, isFarmer,   updateOrderStatus);

module.exports = router;