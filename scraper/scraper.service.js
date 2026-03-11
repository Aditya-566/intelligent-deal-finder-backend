/**
 * Scraper Service — Orchestrates all scrapers in parallel.
 * Uses Promise.allSettled so one failed scraper doesn't break others.
 */

const { scrapeAmazon } = require('./amazon.scraper');
const { scrapeEbay } = require('./ebay.scraper');
const { scrapeWalmart } = require('./walmart.scraper');
const { getMockProducts } = require('./mockData');

/**
 * Run all scrapers in parallel and merge results.
 * @param {string} query - Search term
 * @param {Object} options - { category, brand }
 * @returns {Promise<Array>} - Merged, deduplicated product array
 */
async function scrapeAll(query, options = {}) {
  const useMockOnly = process.env.USE_MOCK_DATA === 'true';
  
  if (useMockOnly) {
    console.log('[Scraper] Using mock data only (USE_MOCK_DATA=true)');
    return getMockProducts(query);
  }

  console.log(`[Scraper] Starting parallel scrape for: "${query}"`);
  const start = Date.now();

  const [amazonResult, ebayResult, walmartResult] = await Promise.allSettled([
    scrapeAmazon(query),
    scrapeEbay(query),
    scrapeWalmart(query),
  ]);

  const allProducts = [];

  if (amazonResult.status === 'fulfilled') {
    allProducts.push(...amazonResult.value);
  } else {
    console.error('[Scraper] Amazon failed:', amazonResult.reason?.message);
    allProducts.push(...getMockProducts(query).filter(p => p.source === 'Amazon'));
  }

  if (ebayResult.status === 'fulfilled') {
    allProducts.push(...ebayResult.value);
  } else {
    console.error('[Scraper] eBay failed:', ebayResult.reason?.message);
    allProducts.push(...getMockProducts(query).filter(p => p.source === 'eBay'));
  }

  if (walmartResult.status === 'fulfilled') {
    allProducts.push(...walmartResult.value);
  } else {
    console.error('[Scraper] Walmart failed:', walmartResult.reason?.message);
    allProducts.push(...getMockProducts(query).filter(p => p.source === 'Walmart'));
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
