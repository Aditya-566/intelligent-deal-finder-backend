const express = require('express');
const router = express.Router();
const { search, getPriceHistory } = require('../controllers/searchController');

router.get('/', search);
router.get('/price-history', getPriceHistory);

module.exports = router;
