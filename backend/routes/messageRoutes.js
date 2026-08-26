const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox, getUnreadCount, getFarmerContact } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',                authMiddleware, sendMessage);
router.get('/inbox',            authMiddleware, getInbox);
router.get('/unread-count',     authMiddleware, getUnreadCount);
router.get('/farmer',           authMiddleware, getFarmerContact);
router.get('/:userId',          authMiddleware, getConversation);

module.exports = router;