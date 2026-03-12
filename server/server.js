require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('Resource Management API is running...');
});

// Seed Admin
const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                username: 'System Admin',
                email: 'admin@system.local',
                password: 'adminpassword', // Will be hashed by pre-save middleware
                role: 'admin'
            });
            console.log('Admin account seeded. Email: admin@system.local | Password: adminpassword');
        }
    } catch (error) {
        console.error('Error seeding admin: ', error.message);
    }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await seedAdmin();
});