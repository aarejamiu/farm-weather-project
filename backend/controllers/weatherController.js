const axios = require('axios');

const getWeather = async (req, res) => {
    const { location } = req.query;

    if (!location){
        return res.status(400).json({ message: 'Location is required' });
    }

    try {
        const apiKey = process.env.WEATHER_API_KEY;

        const response = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);

        const data = response.data;

        const weather = {
            temp: data.main.temp,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            condition: data.weather[0].description,
            location: `${data.name}, ${data.sys.country}`
        };

        res.json({ weather })
        }catch (error) {
            console.error('Weather error:', error.response?.data || error.message);
            res.status(500).json({ message: 'Failed to fetch weather data' });
        }
}

module.exports = { getWeather };