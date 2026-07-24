const axios = require('axios');

const getWeather = async (req, res) => {
    try {
        const location = req.query.location;
        if (!location) return res.status(400).json({ message: 'Location is required' });

        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

        const response = await axios.get(url);
        const data = response.data;

        res.json({
            weather: {
                temp: data.main.temp,
                humidity: data.main.humidity,
                wind: data.wind.speed,
                condition: data.weather[0].description,
                city: data.name
            }
        });
    } catch (error) {
        console.error('Weather error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch weather data' });
    }
};

const getForecast = async (req, res) => {
    try {
        const location = req.query.location;
        if (!location) return res.status(400).json({ message: 'Location is required' });

        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

        const response = await axios.get(url);
        const list = response.data.list;

        const grouped = {};
        for (const item of list) {
            const date = item.dt_txt.split(' ')[0];
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(item);
        }

        const forecast = Object.entries(grouped).slice(0, 7).map(([date, items]) => {
            const conditionCounts = {};
            for (const item of items) {
                const cond = item.weather[0].main;
                conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
            }

            const dominantCondition = Object.entries(conditionCounts)
                .sort((a, b) => b[1] - a[1])[0][0];

            const dayItems = items.filter(i => {
                const hour = parseInt(i.dt_txt.split(' ')[1]);
                return hour >= 9 && hour <= 15;
            });

            const source = dayItems.length > 0 ? dayItems[0] : items[0];
            const temps  = items.map(i => i.main.temp);
            const maxTemp = Math.max(...temps);
            const minTemp = Math.min(...temps);

            const conditionMap = {
                Clear: 'Clear sky',
                Clouds: items.some(i => i.clouds.all < 50) ? 'Partly cloudy' : 'Overcast',
                Rain: source.rain?.['3h'] > 5 ? 'Heavy rain' : 'Light rain',
                Drizzle: 'Light drizzle',
                Thunderstorm: 'Thunderstorm',
                Snow: 'Snow',
                Mist: 'Mist',
                Fog: 'Fog'
            };

            return {
                date: new Date(date).toDateString(),
                temp: maxTemp,
                tempMin: minTemp,
                humidity: source.main.humidity,
                wind: source.wind.speed,
                condition: conditionMap[dominantCondition] || dominantCondition
            };
        });

        res.json({ forecast });
    } catch (error) {
        console.error('Forecast error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch forecast data' });
    }
};

const getHistoricalWeather = async (req, res) => {
    const { location, date } = req.query;
    if (!location || !date) return res.status(400).json({ message: 'location and date are required' });

    try {
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
        const place  = geoRes.data.results?.[0];
        if (!place) return res.status(404).json({ message: 'Location not found' });

        const { latitude, longitude } = place;

        const weatherRes = await axios.get(
            `https://archive-api.open-meteo.com/v1/archive` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&start_date=${date}&end_date=${date}` +
            `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,weathercode` +
            `&timezone=auto`
        );

        const d = weatherRes.data.daily;

        const weathercodeMap = {
            0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
            45:'Fog', 48:'Fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
            61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow',
            73:'Snow', 75:'Heavy snow', 80:'Rain showers', 81:'Showers', 82:'Heavy showers',
            95:'Thunderstorm', 96:'Thunderstorm with hail', 99:'Thunderstorm with hail'
        };

        res.json({
            historical: {
                date:      d.time[0],
                temp:      d.temperature_2m_max[0],
                tempMin:   d.temperature_2m_min[0],
                humidity:  d.relative_humidity_2m_max[0],
                wind:      d.wind_speed_10m_max[0],
                condition: weathercodeMap[d.weathercode[0]] || 'Unknown',
                city:      place.name
            }
        });
    } catch (error) {
        console.error('Historical weather error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to fetch historical weather' });
    }
};

module.exports = { getWeather, getForecast, getHistoricalWeather };

// const axios = require('axios');

// const getWeather = async (req, res) => {

//     try {
//         const location = req.query.location

//         if (!location){
//             return res.status(400).json({ message: 'Location is required' });
//         }    

//     const apiKey = process.env.WEATHER_API_KEY;

//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

//     const response = await axios.get(url)
//     const data = response.data;
//     console.log(response.data);
//         const weather = {
//             temp: data.main.temp,
//             humidity: data.main.humidity,
//             wind: data.wind.speed,
//             condition: data.weather[0].description, 
//             city: data.name
//         };

//         res.json({ weather })
//     }catch (error) {
//             console.error('Weather error:', error.response?.data || error.message);
//             res.status(500).json({ message: 'Failed to fetch weather data' });
//     }
// };

// const getHistoricalWeather = async (req, res) => {
//     const { location, date } = req.query;
//     if (!location || !date) return res.status(400).json({ message: 'location and date are required' });

//     try {
//         // Step 1: city name → coordinates
//         const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
//         const place  = geoRes.data.results?.[0];
//         if (!place) return res.status(404).json({ message: 'Location not found' });

//         const { latitude, longitude } = place;

//         // Step 2: fetch historical data for that date
//         const weatherRes = await axios.get(
//             `https://archive-api.open-meteo.com/v1/archive` +
//             `?latitude=${latitude}&longitude=${longitude}` +
//             `&start_date=${date}&end_date=${date}` +
//             `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max,weathercode` +
//             `&timezone=auto`
//         );

//         const d = weatherRes.data.daily;

//         const weathercodeMap = {
//             0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
//             45:'Fog', 48:'Fog', 51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
//             61:'Light rain', 63:'Rain', 65:'Heavy rain', 71:'Light snow',
//             73:'Snow', 75:'Heavy snow', 80:'Rain showers', 81:'Showers', 82:'Heavy showers',
//             95:'Thunderstorm', 96:'Thunderstorm with hail', 99:'Thunderstorm with hail'
//         };

//         res.json({
//             historical: {
//                 date:      d.time[0],
//                 temp:      d.temperature_2m_max[0],
//                 tempMin:   d.temperature_2m_min[0],
//                 humidity:  d.relative_humidity_2m_max[0],
//                 wind:      d.wind_speed_10m_max[0],
//                 condition: weathercodeMap[d.weathercode[0]] || 'Unknown',
//                 city:      place.name
//             }
//         });
//     } catch (error) {
//         console.error('Historical weather error:', error.response?.data || error.message);
//         res.status(500).json({ message: 'Failed to fetch historical weather' });
//     }
// };

// const getForecast = async (req, res) => {
//     try {
//         const location = req.query.location;

//         if (!location) {
//             return res.status(400).json({ message: 'Location is required' });
//         }

//         const apiKey = process.env.WEATHER_API_KEY;
//         const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

//         const response = await axios.get(url);
//         const data = response.data;

//         const forecast = data.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => ({
//             date: new Date(item.dt_txt).toDateString(),
//             temp: item.main.temp,
//             humidity: item.main.humidity,
//             wind: item.wind.speed,
//             condition: item.weather[0].description
//         }));

//         res.json({ forecast });
//     } catch (error) {
//         console.error('Forecast error:', error.response?.data || error.message);
//         res.status(500).json({ message: 'Failed to fetch forecast data' });
//     }
// };

// module.exports = {
//     getWeather,
//     getForecast,
//     getHistoricalWeather
// };