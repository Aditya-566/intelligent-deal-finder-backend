const Joi = require('joi');

/**
 * Factory: returns Express middleware that validates req.body against schema.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((d) => d.message).join('; ');
    return res.status(400).json({ message: 'Validation error', details: msg });
  }
  next();
};

// ── Auth schemas ──────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

// ── Search schema ─────────────────────────────────────────────────────────────

const searchSchema = Joi.object({
  query: Joi.string().trim().min(1).max(200).required(),
  category: Joi.string().trim().max(50).optional(),
  brand: Joi.string().trim().max(50).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
});

// ── Price alert schema ────────────────────────────────────────────────────────

const priceAlertSchema = Joi.object({
  productName: Joi.string().trim().min(1).max(300).required(),
  productUrl: Joi.string().uri().required(),
  targetPrice: Joi.number().positive().required(),
  currentPrice: Joi.number().positive().required(),
  source: Joi.string().trim().required(),
});

// ── Feedback schema ───────────────────────────────────────────────────────────

const feedbackSchema = Joi.object({
  message: Joi.string().trim().min(5).max(2000).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  email: Joi.string().email().optional().allow(''),
});

module.exports = {
  validate,
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateSearch: (req, res, next) => {
    // Search query comes from req.query, not req.body
    const { error } = searchSchema.validate(req.query, { abortEarly: false });
    if (error) {
      const msg = error.details.map((d) => d.message).join('; ');
      return res.status(400).json({ message: 'Validation error', details: msg });
    }
    next();
  },
  validatePriceAlert: validate(priceAlertSchema),
  validateFeedback: validate(feedbackSchema),
};
