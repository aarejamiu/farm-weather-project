const mongoose = require('mongoose');

const savedDateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: String,
    temp: Number,
    humidity: Number,
    wind: Number,
    condition: String,
    note: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SavedDate', savedDateSchema);