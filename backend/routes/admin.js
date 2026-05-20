const express = require('express');
const { fn, col, literal } = require('sequelize');
const { User, Crop, Order } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── Admin-role guard ──────────────────────────────────────────────────────────
// Sits after authMiddleware; only the hardcoded admin (id = 'admin_1') or any
// future DB user with role = 'admin' may access these routes.
const adminOnly = async (req, res, next) => {
  // req.user is set by the JWT middleware as { id }
  if (req.user) {
    if (req.user.id === 'admin_1') return next();  // hardcoded admin
    try {
      const dbUser = await User.findByPk(req.user.id);
      if (dbUser && dbUser.role === 'admin') {
        return next();
      }
    } catch (err) {
      console.error('[adminOnly middleware check] Error:', err);
    }
  }
  return res.status(403).json({ msg: 'Admin access required' });
};

// ── GET /api/admin/metrics ────────────────────────────────────────────────────
// Returns aggregated platform stats for the Admin Dashboard.
router.get('/metrics', authMiddleware, adminOnly, async (req, res) => {
  try {
    // 1. Total registered users
    const totalUsers = await User.count();

    // 2. Active crops — crops that still have stock (quantity > 0)
    const activeCrops = await Crop.count({
      where: { quantity: { [require('sequelize').Op.gt]: 0 } },
    });

    // 3. Total revenue from paid orders (SUM of totalAmount where paymentStatus = 'paid')
    const revenueResult = await Order.findOne({
      attributes: [[fn('SUM', col('totalAmount')), 'totalRevenue']],
      where: { paymentStatus: 'paid' },
      raw: true,
    });
    const rawRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    // Format as currency string, e.g. "$12,890"
    const transactions = rawRevenue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // 4. Platform health — hardcoded until a real uptime monitor is wired in
    const platformHealth = '99.9%';

    return res.json({
      success: true,
      data: {
        totalUsers:     totalUsers.toLocaleString(),  // e.g. "1,234"
        activeCrops:    activeCrops.toLocaleString(), // e.g. "456"
        transactions,                                 // e.g. "$12,890"
        platformHealth,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/metrics] Error:', err);
    return res.status(500).json({ success: false, msg: 'Server error fetching metrics' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
// Returns all users in the system (excluding passwords).
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('[GET /api/admin/users] Error:', err);
    return res.status(500).json({ success: false, msg: 'Server error fetching users' });
  }
});

// ── POST /api/admin/users ─────────────────────────────────────────────────────
// Create a new user directly from the admin panel.
router.post('/users', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, role, status } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: 'Email is already in use' });
    }
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
      status: status || 'active'
    });
    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('[POST /api/admin/users] Error:', err);
    return res.status(500).json({ success: false, msg: 'Server error creating user' });
  }
});

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────────
// Update a user's details.
router.put('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, role, status } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ success: false, msg: 'Email is already in use' });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) {
      user.password = password; // Hook will automatically hash it
    }
    await user.save();
    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[PUT /api/admin/users/:id] Error:', err);
    return res.status(500).json({ success: false, msg: 'Server error updating user' });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
// Remove a user account.
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    if (req.user.id !== 'admin_1' && Number(req.user.id) === Number(user.id)) {
      return res.status(400).json({ success: false, msg: 'You cannot delete your own account' });
    }
    await user.destroy();
    return res.json({ success: true, msg: 'User account removed successfully' });
  } catch (err) {
    console.error('[DELETE /api/admin/users/:id] Error:', err);
    return res.status(500).json({ success: false, msg: 'Server error deleting user' });
  }
});

module.exports = router;
