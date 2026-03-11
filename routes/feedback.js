const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { validateFeedback } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

// POST /api/feedback
router.post('/', apiLimiter, validateFeedback, async (req, res) => {
  try {
    const { message, rating, email } = req.body;
    const feedback = await Feedback.create({
      message,
      rating: rating || null,
      email: email || '',
      userAgent: req.headers['user-agent'] || '',
    });
    res.status(201).json({ message: 'Thank you for your feedback!', id: feedback._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save feedback', error: err.message });
  }
});

// GET /api/feedback (admin only — add protect middleware in production)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ feedback, page });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

module.exports = router;
