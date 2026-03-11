const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  saveSearch, getSavedSearches, deleteSavedSearch,
  addBookmark, getBookmarks, deleteBookmark,
} = require('../controllers/userController');

router.post('/save-search', protect, saveSearch);
router.get('/saved-searches', protect, getSavedSearches);
router.delete('/saved-searches/:id', protect, deleteSavedSearch);
router.post('/bookmark', protect, addBookmark);
router.get('/bookmarks', protect, getBookmarks);
router.delete('/bookmarks/:id', protect, deleteBookmark);

module.exports = router;
