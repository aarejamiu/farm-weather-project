const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { saveDate, getDates, deleteDate } = require('../controllers/dateController');
const router = express.Router();


router.post('/save', authMiddleware, saveDate),
router.get('/get', authMiddleware, getDates),
router.delete('/:id', authMiddleware, deleteDate)

module.exports = router;