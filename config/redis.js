const Redis = require('ioredis');
const logger = require('./logger');

let client = null;

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on('connect', () => logger.info('✅ Redis connected'));
  client.on('error', (err) => logger.warn('⚠️  Redis error (cache disabled):', err.message));
} else {
  logger.info('ℹ️  REDIS_URL not set — running without cache');
}

/**
 * Get a cached value. Returns parsed JSON or null.
 */
async function getCache(key) {
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/**
 * Set a value in cache with TTL (seconds).
 */
async function setCache(key, value, ttlSeconds = 600) {
  if (!client) return;
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Silently ignore cache write failures
  }
}

/**
 * Delete a cache key.
 */
async function delCache(key) {
  if (!client) return;
  try {
    await client.del(key);
  } catch { /* ignore */ }
}

module.exports = { getCache, setCache, delCache };
