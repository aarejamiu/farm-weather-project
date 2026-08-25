const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAddress, updateFarmLocation } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.put('/address', authMiddleware, updateAddress);
router.put('/location', authMiddleware, updateFarmLocation);

module.exports = router;