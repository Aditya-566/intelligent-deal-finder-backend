const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  productUrl: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  source: { type: String, required: true },
  triggered: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Compound index for efficient cron job queries
priceAlertSchema.index({ userId: 1, triggered: 1 });
priceAlertSchema.index({ triggered: 1, active: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
