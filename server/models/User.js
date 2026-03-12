const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: function() { return this.role === 'user'; },
        trim: true,
    },
    designation: {
        type: String,
        required: function() { return this.role === 'user'; },
        trim: true,
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true, // sparse because admin might not have an employeeId
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    }
}, {
    timestamps: true
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
