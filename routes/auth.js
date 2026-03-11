const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validate');

// ── Email/Password Auth ───────────────────────────────────────────────────────
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google sends user back here after auth
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Generate JWT for the authenticated user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // Redirect to frontend with token in URL param (OAuthRedirect page will capture it)
    res.redirect(`${process.env.CLIENT_URL}/oauth-redirect?token=${token}`);
  }
);

module.exports = router;
