const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  minPrice: { type: Number, default: 0 },
  maxPrice: { type: Number, default: 10000 },
  filters: {
    category: { type: String, default: '' },
    brand: { type: String, default: '' },
    sortBy: { type: String, default: 'price', enum: ['price', 'dealScore'] },
  },
}, { timestamps: true });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
