const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtkey } = require('../keys');
const router = express.Router();
const User = require('../models/User'); 

// SIGNUP
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(422).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ error: "Email already registered" });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ userId: user._id }, jwtkey, { expiresIn: "7d" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// SIGNIN
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;  // ✅ Only require email and password

    if (!email || !password) {
        return res.status(422).json({ error: "Must provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    try {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, jwtkey, { expiresIn: "7d" });
        res.json({ token });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
