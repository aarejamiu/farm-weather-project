const express = require('express');
const router = express.Router();
const { saveDate, getDates, deleteDate } = require('../controllers/dateController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/save', authMiddleware, saveDate),
router.get('/get', authMiddleware, getDates),
router.delete('/:id', authMiddleware, deleteDate)

module.exports = router;