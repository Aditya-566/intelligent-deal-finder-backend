const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validate');

// ── Helper: ensure CLIENT_URL always has https:// ─────────────────────────────
// If Render env var is set without the protocol (e.g., "myapp.vercel.app")
// the redirect becomes a relative path on the backend → Route not found.
function getClientUrl() {
  const url = process.env.CLIENT_URL || 'http://localhost:5173';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

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
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${getClientUrl()}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const clientUrl = getClientUrl();
    // Generate JWT for the authenticated user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // Absolute redirect to frontend /oauth-redirect page
    res.redirect(`${clientUrl}/oauth-redirect?token=${token}`);
  }
);

module.exports = router;
