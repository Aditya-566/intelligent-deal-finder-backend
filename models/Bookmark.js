const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  productUrl: { type: String, required: true },
  source: { type: String, required: true },
  rating: { type: Number, default: null },
  reviews: { type: Number, default: null },
  originalPrice: { type: Number, default: null },
}, { timestamps: true });

// Prevent duplicate bookmarks for same user/product
bookmarkSchema.index({ userId: 1, productUrl: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
