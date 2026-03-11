const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { setPriceAlert, getPriceAlerts } = require('../controllers/userController');

router.post('/', protect, setPriceAlert);
router.get('/', protect, getPriceAlerts);

module.exports = router;
