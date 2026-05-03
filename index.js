require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const app = require('./backend/app')
require('dotenv').config()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})