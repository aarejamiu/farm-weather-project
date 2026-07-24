const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getInbox } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',                authMiddleware, sendMessage);
router.get('/inbox',            authMiddleware, getInbox);
router.get('/:userId',          authMiddleware, getConversation);

module.exports = router;