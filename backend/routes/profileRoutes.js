const express = require('express');
const router = express.Router();
const { getProfile, updateFarmLocation } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getProfile);
router.put('/location', authMiddleware, updateFarmLocation);

module.exports = router;