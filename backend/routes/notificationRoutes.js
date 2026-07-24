const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markOneRead } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/',             authMiddleware, getNotifications);
router.put('/read-all',     authMiddleware, markAllRead);
router.put('/:id/read',     authMiddleware, markOneRead);

module.exports = router;