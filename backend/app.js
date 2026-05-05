const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./routes/authroute')
const weatherRoutes = require('./routes/weatherRoutes')
const dateRoutes = require('./routes/dateRoutes')

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/dates', dateRoutes)

module.exports = app