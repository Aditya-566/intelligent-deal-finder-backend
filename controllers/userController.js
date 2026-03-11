const SavedSearch = require('../models/SavedSearch');
const Bookmark = require('../models/Bookmark');
const PriceAlert = require('../models/PriceAlert');

// POST /api/user/save-search
const saveSearch = async (req, res) => {
  try {
    const { query, minPrice, maxPrice, filters } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    const saved = await SavedSearch.create({
      userId: req.user._id,
      query,
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 10000,
      filters: filters || {},
    });

    res.status(201).json({ message: 'Search saved', savedSearch: saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save search', error: err.message });
  }
};

// GET /api/user/saved-searches
const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(searches);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get saved searches', error: err.message });
  }
};

// DELETE /api/user/saved-searches/:id
const deleteSavedSearch = async (req, res) => {
  try {
    const search = await SavedSearch.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!search) return res.status(404).json({ message: 'Saved search not found' });
    res.json({ message: 'Saved search deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete saved search', error: err.message });
  }
};

// POST /api/user/bookmark
const addBookmark = async (req, res) => {
  try {
    const { productName, price, imageUrl, productUrl, source, rating, reviews, originalPrice } = req.body;
    if (!productName || !price || !productUrl || !source)
      return res.status(400).json({ message: 'Product details required' });

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      productName,
      price,
      imageUrl,
      productUrl,
      source,
      rating,
      reviews,
      originalPrice,
    });

    res.status(201).json({ message: 'Product bookmarked', bookmark });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Product already bookmarked' });
    res.status(500).json({ message: 'Failed to bookmark product', error: err.message });
  }
};

// GET /api/user/bookmarks
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get bookmarks', error: err.message });
  }
};

// DELETE /api/user/bookmarks/:id
const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove bookmark', error: err.message });
  }
};

// POST /api/price-alert
const setPriceAlert = async (req, res) => {
  try {
    const { productName, productUrl, targetPrice, currentPrice, source } = req.body;
    if (!productUrl || !targetPrice || !currentPrice)
      return res.status(400).json({ message: 'Product URL, target price, and current price are required' });

    const alert = await PriceAlert.create({
      userId: req.user._id,
      productName,
      productUrl,
      targetPrice,
      currentPrice,
      source,
    });

    res.status(201).json({ message: 'Price alert set', alert });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set price alert', error: err.message });
  }
};

// GET /api/price-alert
const getPriceAlerts = async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get price alerts', error: err.message });
  }
};

module.exports = {
  saveSearch, getSavedSearches, deleteSavedSearch,
  addBookmark, getBookmarks, deleteBookmark,
  setPriceAlert, getPriceAlerts,
};
