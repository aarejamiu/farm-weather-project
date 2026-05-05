const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
// const { getWeather } = require('../controllers/weatherController');

router.post('/register', registerUser)
router.post('/login', loginUser)
// router.get('/weather', getWeather)

module.exports = router;