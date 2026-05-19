const axios = require('axios');

const getWeather = async (req, res) => {

    try {
        const location = req.query.location

        if (!location){
            return res.status(400).json({ message: 'Location is required' });
        }    

    const apiKey = process.env.WEATHER_API_KEY;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url)
    const data = response.data;

        const weather = {
            temp: data.main.temp,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            condition: data.weather[0].description,
            city: data.name
        };

        res.json({ weather })
    }catch (error) {
            console.error('Weather error:', error.response?.data || error.message);
            res.status(500).json({ message: 'Failed to fetch weather data' });
    }
}

module.exports = {getWeather};