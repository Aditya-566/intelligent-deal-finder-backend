const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const passport = require('./config/passport');
const { apiLimiter, searchLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');
const { startPriceAlertJob } = require('./jobs/priceAlertJob');

dotenv.config();

// ── Sentry (optional — only init if DSN is set) ────────────────────────────────
let Sentry;
if (process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.2,
  });
}

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Customise CSP separately if needed
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize()); // Prevent MongoDB operator injection

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Sessions (required only for Passport OAuth callback flow) ─────────────────
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 mins – just long enough for OAuth round-trip
  },
}));

// ── Passport ───────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Rate limiting ──────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/search', searchLimiter);

// ── Sentry request handler (must be before routes) ────────────────────────────
if (Sentry) app.use(Sentry.Handlers.requestHandler());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));          // Google OAuth at /auth/google
app.use('/api/auth', require('./routes/auth'));      // email/pw at /api/auth/login
app.use('/api/search', require('./routes/search'));
app.use('/api/user', require('./routes/user'));
app.use('/api/price-alert', require('./routes/priceAlert'));
app.use('/api/feedback', require('./routes/feedback'));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', message: 'Intelligent Deal Finder API running', ts: new Date().toISOString() })
);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Sentry error handler ───────────────────────────────────────────────────────
if (Sentry) app.use(Sentry.Handlers.errorHandler());

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Connect to MongoDB and start server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('✅ MongoDB connected');
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      // Start background jobs after server is listening
      startPriceAlertJob();
    });
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
