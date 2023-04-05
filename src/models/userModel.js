const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'User must have a username'],
        unique: [true, 'Username already taken'],
    },
    fullName: {
        type: String,
        required: [true, 'User must have a name'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8,
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
