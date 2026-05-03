require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const app = require('./backend/app')
const mongoose = require('mongoose')
require('dotenv').config()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

const dbUri = process.env.MONGODB_URI;
if (!dbUri) {
    console.error("MONGODB_URI is not defined. Check your .env file.");
    process.exit(1);
}

mongoose.connect(dbUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log('MongoDB Connected');
//     } catch (err) {
//         console.error(err.message);
//         process.exit(1);
//     }
// }
// module.exports = connectDB;

// const connectDB = require('./config/db');

// connectDB();