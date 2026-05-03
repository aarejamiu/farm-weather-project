const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./routes/authroute')

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

module.exports = app