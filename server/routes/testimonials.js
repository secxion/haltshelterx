const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { authenticate, authorize } = require('../middleware/auth');

// Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Create testimonial (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, role, quote, photoUrl } = req.body;
    const testimonial = new Testimonial({ name, role, quote, photoUrl });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create testimonial' });
  }
});

// Update testimonial (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!testimonial) return res.status(404).json({ error: 'Not found' });
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
