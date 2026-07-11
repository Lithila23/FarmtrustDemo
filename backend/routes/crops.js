const express = require('express');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { Crop, User } = require('../models');
const router = express.Router();

// Helper: Try to decode the JWT token from the request header without requiring auth.
// Used to allow farmers to see their own pending/rejected crops and admins to see all.
const getRequester = (req) => {
  const token = req.header('x-auth-token');
  if (!token) return null;

  const secrets = [];
  if (process.env.JWT_SECRET) secrets.push(process.env.JWT_SECRET);
  secrets.push('secret');

  for (const secret of secrets) {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded.user || null;
    } catch (err) {
      // Try the next secret.
    }
  }

  return null;
};

// ── GET /api/crops ────────────────────────────────────────────────────────────
// Public / buyer-facing: only approved crops are shown in the marketplace.
// Farmers see their own crops at any status. Admins see all.
router.get('/', async (req, res) => {
  try {
    const requester = getRequester(req);
    const isAdmin = requester?.id === 'admin_1';

    const whereClause = isAdmin
      ? {}
      : requester
        ? {
            [Op.or]: [
              { status: 'approved' },
              { farmerId: requester.id },
            ],
          }
        : { status: 'approved' };

    const crops = await Crop.findAll({
      where: whereClause,
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(crops);
  } catch (err) {
    console.error('Get crops error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── GET /api/crops/my ─────────────────────────────────────────────────────────
// Farmer-only: returns all of the logged-in farmer's crops (all statuses).
router.get('/my', auth, async (req, res) => {
  try {
    const crops = await Crop.findAll({
      where: { farmerId: req.user.id },
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(crops);
  } catch (err) {
    console.error('Get my crops error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── POST /api/crops ───────────────────────────────────────────────────────────
// Add a new crop — always starts as 'pending' (awaiting admin approval).
router.post('/', auth, async (req, res) => {
  const { name, quantity, price, description, district, discount } = req.body;
  try {
    const crop = await Crop.create({
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      description,
      status: 'pending',  // Must be approved by admin before going live
      district,
      discount: discount ? parseInt(discount) : 0,
      farmerId: req.user.id,
    });

    const cropWithFarmer = await Crop.findByPk(crop.id, {
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email', 'district'] }]
    });

    // ── Immediate Response ───────────────────────────────────────────────────
    // Return early to ensure the UI feels lightning fast
    res.status(201).json({
      ...cropWithFarmer.toJSON(),
      status: cropWithFarmer.status,
      msg: 'Crop submitted for admin approval',
    });

  } catch (err) {
    console.error('Add crop error:', err);
    if (!res.headersSent) res.status(500).json({ msg: 'Server error' });
  }
});

// ── PUT /api/crops/:id ────────────────────────────────────────────────────────
// Farmer updates their own crop. Editing resets status back to 'pending'
// so the admin reviews the changes before it goes live again.
router.put('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    if (crop.farmerId !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    // Update fields and reset status to pending for re-review
    await crop.update({
      ...req.body,
      status: 'pending'
    });

    const updatedCrop = await Crop.findByPk(crop.id, {
      include: [{ model: User, as: 'farmer', attributes: ['id', 'name', 'email'] }]
    });
    res.json(updatedCrop);
  } catch (err) {
    console.error('Update crop error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── DELETE /api/crops/:id ─────────────────────────────────────────────────────
// Farmer deletes their own crop at any time (regardless of status).
router.delete('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) return res.status(404).json({ msg: 'Crop not found' });
    if (crop.farmerId !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    await crop.destroy();
    res.json({ msg: 'Crop deleted' });
  } catch (err) {
    console.error('Delete crop error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;