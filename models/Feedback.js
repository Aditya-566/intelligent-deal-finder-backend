const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5, default: null },
  email: { type: String, lowercase: true, trim: true, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
