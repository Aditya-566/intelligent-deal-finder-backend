/**
 * Scraper Service — Orchestrates Amazon, Flipkart, and Myntra in parallel.
 * Uses Promise.allSettled so one failed scraper doesn't break others.
 */

const { scrapeAmazon } = require('./amazon.scraper');
const { scrapeFlipkart } = require('./flipkart.scraper');
const { scrapeMyntra } = require('./myntra.scraper');

async function scrapeAll(query, options = {}) {
  console.log(`[Scraper] Starting parallel scrape for: "${query}"`);
  const start = Date.now();

  const scraperTimeout = 40000;
  const withTimeout = (promise, name) => 
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`${name} timed out after ${scraperTimeout/1000}s`)), scraperTimeout))
    ]);

  const [amazonResult, flipkartResult, myntraResult] = await Promise.allSettled([
    withTimeout(scrapeAmazon(query), 'Amazon'),
    withTimeout(scrapeFlipkart(query), 'Flipkart'),
    withTimeout(scrapeMyntra(query), 'Myntra'),
  ]);

  const allProducts = [];

  if (amazonResult.status === 'fulfilled') {
    allProducts.push(...amazonResult.value);
  } else {
    console.error('[Scraper] Amazon failed:', amazonResult.reason?.message);
  }

  if (flipkartResult.status === 'fulfilled') {
    allProducts.push(...flipkartResult.value);
  } else {
    console.error('[Scraper] Flipkart failed:', flipkartResult.reason?.message);
  }

  if (myntraResult.status === 'fulfilled') {
    allProducts.push(...myntraResult.value);
  } else {
    console.error('[Scraper] Myntra failed:', myntraResult.reason?.message);
  }

  // Deduplicate by productUrl
  const seen = new Set();
  const unique = allProducts.filter(p => {
    if (!p.productUrl || seen.has(p.productUrl)) return false;
    seen.add(p.productUrl);
    return true;
  });

  // Filter by brand/category if provided
  let filtered = unique;
  if (options.brand) {
    const brand = options.brand.toLowerCase();
    filtered = filtered.filter(p => p.productName.toLowerCase().includes(brand));
  }
  if (options.category && options.category !== 'all') {
    const cat = options.category.toLowerCase();
    filtered = filtered.filter(p => p.productName.toLowerCase().includes(cat));
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[Scraper] Done in ${elapsed}s — ${filtered.length} unique products found`);

  return filtered;
}

module.exports = { scrapeAll };
