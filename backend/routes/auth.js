const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by beforeCreate hook
      role: role || 'buyer'
    });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // ── Master Admin credential check (intercept BEFORE any DB query) ────────
    // Admins cannot self-register; this is the sole entry point for admin auth.
    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@farmtrust.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminPayload = { user: { id: 'admin_1' } };
      return jwt.sign(
        adminPayload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            console.error('JWT sign error (admin):', err);
            return res.status(500).json({ msg: 'Server error' });
          }
          return res.json({
            token,
            user: {
              id:    'admin_1',
              name:  'System Admin',
              email: ADMIN_EMAIL,
              role:  'admin',
            },
          });
        }
      );
    }
    // ── Standard DB-backed login (Farmer / Buyer) ─────────────────────────────

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ msg: 'Account is inactive. Please contact the administrator.' });
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        // Return the token AND the user profile so the frontend can
        // perform role-based routing without a second API call.
        res.json({
          token,
          user: {
            id:    user.id,
            name:  user.name,
            email: user.email,
            role:  user.role,   // ENUM: 'farmer' | 'buyer' | 'admin'
          },
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;