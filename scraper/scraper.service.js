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

  // Overall timeout per scraper — 25s is enough; Myntra API is now fast
  const scraperTimeout = 25000;
  const withTimeout = (promise, name) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${name} timed out after ${scraperTimeout / 1000}s`)), scraperTimeout)
      ),
    ]);

  const [amazonResult, flipkartResult, myntraResult] = await Promise.allSettled([
    withTimeout(scrapeAmazon(query), 'Amazon'),
    withTimeout(scrapeFlipkart(query), 'Flipkart'),
    withTimeout(scrapeMyntra(query), 'Myntra'),
  ]);

  const allProducts = [];

  if (amazonResult.status === 'fulfilled') {
    console.log(`[Scraper] Amazon: ${amazonResult.value.length} products`);
    allProducts.push(...amazonResult.value);
  } else {
    console.error('[Scraper] Amazon failed:', amazonResult.reason?.message);
  }

  if (flipkartResult.status === 'fulfilled') {
    console.log(`[Scraper] Flipkart: ${flipkartResult.value.length} products`);
    allProducts.push(...flipkartResult.value);
  } else {
    console.error('[Scraper] Flipkart failed:', flipkartResult.reason?.message);
  }

  if (myntraResult.status === 'fulfilled') {
    console.log(`[Scraper] Myntra: ${myntraResult.value.length} products`);
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

  // ── Filter by brand/category ─────────────────────────────────────────────────
  // IMPORTANT: Only filter if the brand/category term is NOT already in the search query.
  // The query already contains the term, so the scrapers already searched for it.
  // Over-filtering causes 0 results.
  let filtered = unique;
  const lowerQuery = query.toLowerCase();

  if (options.brand && options.brand.trim() !== '') {
    const brand = options.brand.toLowerCase().trim();
    // Skip filter if brand is already part of what we searched for
    if (!lowerQuery.includes(brand)) {
      const brandFiltered = filtered.filter(p =>
        p.productName.toLowerCase().includes(brand)
      );
      // Only apply filter if it keeps at least some results; don't produce 0 results
      if (brandFiltered.length > 0) {
        filtered = brandFiltered;
        console.log(`[Scraper] Brand filter "${brand}": ${filtered.length} products remain`);
      } else {
        console.warn(`[Scraper] Brand filter "${brand}" would remove all results — skipping filter`);
      }
    }
  }

  if (options.category && options.category !== 'All Categories' && options.category !== '') {
    const cat = options.category.toLowerCase().trim();
    const catSingular = cat.endsWith('s') ? cat.slice(0, -1) : cat;
    // Only filter if the category isn't already the main thing they searched for
    if (!lowerQuery.includes(cat) && !lowerQuery.includes(catSingular)) {
      const catFiltered = filtered.filter(p => {
        const name = p.productName.toLowerCase();
        return name.includes(cat) || name.includes(catSingular);
      });
      // Only apply filter if it keeps at least some results
      if (catFiltered.length > 0) {
        filtered = catFiltered;
        console.log(`[Scraper] Category filter "${cat}": ${filtered.length} products remain`);
      } else {
        console.warn(`[Scraper] Category filter "${cat}" would remove all results — skipping filter`);
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[Scraper] Done in ${elapsed}s — ${filtered.length} unique products found (from ${allProducts.length} raw)`);

  return filtered;
}

module.exports = { scrapeAll };
