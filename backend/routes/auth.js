// ============================================================
// routes/auth.js
// Simple authentication — no JWT, no bcrypt.
// Register: insert user into MongoDB.
// Login:    find user and compare plain-text password.
// ============================================================

const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// ----------------------------------------------------------
// POST /api/auth/register
// Body: { name, email, password, child? }
// Creates a new user account.
// ----------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, child } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check if email is already taken
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'That email is already registered.' });
    }

    // Create and save new user (password stored as-is — simple auth)
    const user = await User.create({
      name,
      email,
      password,
      child: child || {}
    });

    res.status(201).json({
      success: true,
      message: `Welcome to StoryLand, ${user.name}! 🎉`,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        child: user.child
      }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ----------------------------------------------------------
// POST /api/auth/login
// Body: { email, password }
// Finds the user and checks the password.
// ----------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with that email.' });
    }

    // Compare plain-text passwords
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 📚`,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        child: user.child
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ----------------------------------------------------------
// GET /api/auth/profile/:id
// Returns user profile by ID (stored in localStorage).
// ----------------------------------------------------------
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ----------------------------------------------------------
// PUT /api/auth/profile/:id
// Body: { name, child }
// Updates user profile.
// ----------------------------------------------------------
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, child } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, child },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'Profile updated! ✨', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
