require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // For parsing application/json

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Endpoint to convert city name to geographical coordinates and fetch weather
app.get('/weather', async (req, res) => {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ message: "No city provided" });
    }

    if (!API_KEY) {
        console.error('No API Key set for OpenWeatherMap');
        return res.status(500).json({ message: 'Internal server error' });
    }

    const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;

    try {
        // Geocoding: Convert city name to coordinates
        const geocodeResponse = await axios.get(geocodeUrl);

        if (geocodeResponse.data && geocodeResponse.data.length) {
            const { lat, lon } = geocodeResponse.data[0];

            // Fetch weather using the obtained coordinates
            const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const weatherResponse = await axios.get(weatherUrl);

            res.json(weatherResponse.data);
        } else {
            res.status(404).json({ message: "Location not found" });
        }
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error(error.request);
            res.status(500).json({ message: 'No response received from geocoding API' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
            res.status(500).json({ message: 'Error setting up request to geocoding API' });
        }
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
