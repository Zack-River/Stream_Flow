const mongoose = require('mongoose');

const userShcema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: [2,"Name must be more than 2 letters!"],
        required: [true,"Name required!"],
    },
    username: {
        type: String,
        lowercase: true,
        unique: [true,"slug must be Unique!"]
    },
    email: {
        type: String,
        required: [true,"Email required!"],
        unique: [true,"Email must be Unique!"],
        lowercase: true,
        select: false
    },
    phone: {
        type: String,
        default: "No Phone Number"
    },
    profileImg: {
        type: String,
        default: "No Profile Picture"
    },
    password: {
        type: String,
        required: true,
        minlength: [6,"Too short password!"],
        select: false
    },
    role: {
        type: String,
        enum: ["user","admin"],
        default: "user"
    },
    refreshToken: {
        type: String,
        default: "",
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    }
},
{ timestamps:true }
);

const User = mongoose.model('User', userShcema);

module.exports = User;