const express = require('express');
const router = express.Router();
const { getWeather, getForecast, getHistoricalWeather } = require('../controllers/weatherController');

router.get('/weather', getWeather);
router.get('/forecast', getForecast);
router.get('/historical', getHistoricalWeather);

module.exports = router;