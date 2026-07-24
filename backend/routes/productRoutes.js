const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getPublicProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleAvailability
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { isFarmer } = require('../middleware/roleMiddleware');

router.get('/public',           getPublicProducts);
router.get('/:id',              getProductById);
router.get('/',                 authMiddleware, isFarmer, getAllProducts);
router.post('/',                authMiddleware, isFarmer, createProduct);
router.put('/:id',              authMiddleware, isFarmer, updateProduct);
router.delete('/:id',           authMiddleware, isFarmer, deleteProduct);
router.patch('/:id/toggle',     authMiddleware, isFarmer, toggleAvailability);

module.exports = router;