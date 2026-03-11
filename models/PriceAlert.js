const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  productUrl: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  source: { type: String, required: true },
  triggered: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
