const express = require('express');
const auth = require('../middleware/auth');
const { Crop, User } = require('../models');

const router = express.Router();

// Get all crops
router.get('/', async (req, res) => {
  try {
    const crops = await Crop.findAll({
      include: [{
        model: User,
        as: 'farmer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(crops);
  } catch (err) {
    console.error('Get crops error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add crop (farmer only)
router.post('/', auth, async (req, res) => {
  const { name, quantity, price, description } = req.body;
  try {
    const crop = await Crop.create({
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      description,
      farmerId: req.user.id
    });

    // Fetch the created crop with farmer info
    const cropWithFarmer = await Crop.findByPk(crop.id, {
      include: [{
        model: User,
        as: 'farmer',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(cropWithFarmer);
  } catch (err) {
    console.error('Add crop error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update crop
router.put('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) {
      return res.status(404).json({ msg: 'Crop not found' });
    }

    // Check if user owns this crop
    if (crop.farmerId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await crop.update(req.body);

    // Fetch updated crop with farmer info
    const updatedCrop = await Crop.findByPk(crop.id, {
      include: [{
        model: User,
        as: 'farmer',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json(updatedCrop);
  } catch (err) {
    console.error('Update crop error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete crop
router.delete('/:id', auth, async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) {
      return res.status(404).json({ msg: 'Crop not found' });
    }

    // Check if user owns this crop
    if (crop.farmerId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await crop.destroy();
    res.json({ msg: 'Crop deleted' });
  } catch (err) {
    console.error('Delete crop error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;