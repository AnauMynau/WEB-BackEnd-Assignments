const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db-mongodb');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const db = getDb();

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or username already exists' });
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);

        // Create session
        req.session.userId = result.insertedId.toString();
        req.session.username = username;

        res.status(201).json({
            message: 'Registration successful',
            user: { username, email }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = getDb();

        // Find user
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            // Generic error message for security
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Generic error message for security
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        req.session.userId = user._id.toString();
        req.session.username = user.username;

        res.json({
            message: 'Login successful',
            user: { username: user.username, email: user.email }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;
