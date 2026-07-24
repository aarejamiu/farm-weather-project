const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'customer'],
        default: 'customer'
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    farmLocation: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);