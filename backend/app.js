const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./routes/authroute')
const weatherRoutes = require('./routes/weatherRoutes')
const dateRoutes = require('./routes/dateRoutes')
const profileRoutes = require('./routes/profileRoutes')

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/dates', dateRoutes)
app.use('/api/profile', profileRoutes)

module.exports = app