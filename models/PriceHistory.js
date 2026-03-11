const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productUrl: { type: String, required: true },
  productName: { type: String, required: true },
  source: { type: String, required: true },
  pricePoints: [
    {
      price: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ],
});

priceHistorySchema.index({ productUrl: 1 }, { unique: true });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
