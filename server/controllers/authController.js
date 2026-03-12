const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user (employee)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, company, designation } = req.body;

        if (!username || !email || !password || !company || !designation) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Auto-generate employeeId
        // Format: <FIRST 3 LETTERS OF COMPANY IN UPPERCASE><EMPLOYEE_NUMBER>
        const companyPrefix = company.substring(0, 3).toUpperCase();
        
        // Find the last user from this company to get the incremented number
        // Note: Using regex to match the prefix, e.g., ^CTS
        const lastEmployee = await User.findOne({ 
            employeeId: { $regex: `^${companyPrefix}` } 
        }).sort({ createdAt: -1 });

        let empNumber = 1;
        if (lastEmployee && lastEmployee.employeeId) {
            const lastNumberStr = lastEmployee.employeeId.replace(companyPrefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                empNumber = lastNumber + 1;
            }
        }
        const employeeId = `${companyPrefix}${empNumber}`;

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            company,
            designation,
            employeeId,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                employeeId: user.employeeId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user or admin
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                employeeId: user.employeeId,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
