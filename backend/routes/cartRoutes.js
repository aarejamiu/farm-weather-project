const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');

router.get('/',                         authMiddleware, isCustomer, getCart);
router.post('/add',                     authMiddleware, isCustomer, addToCart);
router.put('/item/:productId',          authMiddleware, isCustomer, updateCartItem);
router.delete('/item/:productId',       authMiddleware, isCustomer, removeFromCart);
router.delete('/clear',                 authMiddleware, isCustomer, clearCart);

module.exports = router;