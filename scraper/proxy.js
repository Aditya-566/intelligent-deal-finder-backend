/**
 * Proxy & User-Agent rotation helpers for scrapers.
 * Integrates with ScraperAPI (optional) and rotates user-agent strings to avoid bans.
 */

// ── User-Agent pool ───────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
];

/**
 * Returns a random user-agent string.
 */
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ── ScraperAPI URL builder ────────────────────────────────────────────────────

/**
 * Wraps a target URL with ScraperAPI proxy if SCRAPERAPI_KEY is set.
 * Falls back to the original URL otherwise.
 * @param {string} targetUrl
 * @returns {string}
 */
function getProxiedUrl(targetUrl) {
  const key = process.env.SCRAPERAPI_KEY;
  if (!key) return targetUrl;
  return `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(targetUrl)}&render=false`;
}

// ── Retry helper ──────────────────────────────────────────────────────────────

/**
 * Retry an async function up to `maxAttempts` times with exponential back-off.
 * @param {Function} fn   - Async function to retry
 * @param {number} maxAttempts
 * @param {number} baseDelayMs
 */
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1000) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ── robots.txt check ──────────────────────────────────────────────────────────

const axios = require('axios');
const robotsCache = new Map();

/**
 * Returns true if the path is allowed to be scraped per robots.txt rules.
 * Caches the result per domain for 10 minutes.
 * IMPORTANT: Always verify you have the right to scrape a site, regardless of robots.txt.
 */
async function isAllowedByRobots(targetUrl) {
  try {
    const url = new URL(targetUrl);
    const domain = `${url.protocol}//${url.hostname}`;
    const path = url.pathname;

    const now = Date.now();
    const cached = robotsCache.get(domain);
    if (cached && now - cached.ts < 10 * 60 * 1000) {
      return !cached.disallowed.some((rule) => path.startsWith(rule));
    }

    const robotsUrl = `${domain}/robots.txt`;
    const res = await axios.get(robotsUrl, { timeout: 5000 });
    const lines = res.data.split('\n');
    const disallowed = [];

    let capture = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^User-agent:\s*\*/i)) capture = true;
      else if (trimmed.match(/^User-agent:/i)) capture = false;
      else if (capture && trimmed.match(/^Disallow:/i)) {
        const rulePath = trimmed.replace(/^Disallow:\s*/i, '').trim();
        if (rulePath) disallowed.push(rulePath);
      }
    }

    robotsCache.set(domain, { disallowed, ts: now });
    return !disallowed.some((rule) => path.startsWith(rule));
  } catch {
    // If robots.txt can't be fetched, allow by default
    return true;
  }
}

module.exports = { getRandomUserAgent, getProxiedUrl, withRetry, isAllowedByRobots };
