const scraperService = require('../scraper/scraper.service');
const PriceHistory = require('../models/PriceHistory');
const { getCache, setCache } = require('../config/redis');
const logger = require('../config/logger');

// GET /api/search
const search = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, brand, sortBy } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 999999;
    const sort = sortBy || 'dealScore';

    // Check Redis cache (10-min TTL)
    const cacheKey = `search:${q.toLowerCase()}:${min}:${max}:${category || ''}:${brand || ''}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info(`⚡ Cache hit: ${cacheKey}`);
      return res.json({ results: cached, fromCache: true, total: cached.length });
    }

    logger.info(`🔍 Searching for: "${q}" | Budget: ₹${min} - ₹${max}`);

    // Run scrapers — pass query with brand baked in for better results
    // If a brand is specified, append it to the query so scrapers search more specifically
    const searchQuery = brand && !q.toLowerCase().includes(brand.toLowerCase())
      ? `${q} ${brand}`
      : q;

    const allProducts = await scraperService.scrapeAll(searchQuery, { category, brand });

    if (allProducts.length === 0) {
      logger.warn(`[Search] No products returned from any scraper for: "${q}"`);
      // Return empty but valid response — don't cache empty results
      return res.json({
        results: [],
        fromCache: false,
        total: 0,
        query: q,
        filters: { min, max, category, brand, sort },
        message: 'No results found. Try different keywords or check your filters.',
      });
    }

    // Filter by budget — be lenient: if ALL products are outside budget, ignore budget filter
    let filtered = allProducts.filter(p => p.price >= min && p.price <= max);

    // If price filtering removed everything, return all results and warn
    if (filtered.length === 0 && allProducts.length > 0) {
      logger.warn(`[Search] Budget filter (₹${min}-₹${max}) removed all ${allProducts.length} results. Returning all.`);
      filtered = allProducts;
    }

    // Calculate deal score (discount percentage if available)
    filtered = filtered.map(p => ({
      ...p,
      dealScore: p.originalPrice && p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0,
    }));

    // Sort
    if (sort === 'dealScore') {
      filtered.sort((a, b) => b.dealScore - a.dealScore);
    } else if (sort === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: best deal score then price
      filtered.sort((a, b) => b.dealScore - a.dealScore || a.price - b.price);
    }

    // Return top 20 results (was 5 — too restrictive)
    const topResults = filtered.slice(0, 20);

    // Store price history for top results (non-blocking)
    setImmediate(async () => {
      for (const product of topResults.slice(0, 10)) {
        try {
          await PriceHistory.findOneAndUpdate(
            { productUrl: product.productUrl },
            {
              productName: product.productName,
              source: product.source,
              $push: { pricePoints: { price: product.price, timestamp: new Date() } },
            },
            { upsert: true, new: true }
          );
        } catch (e) {
          // Silently fail for price history
        }
      }
    });

    // Cache results in Redis for 10 minutes (only if we have results)
    if (topResults.length > 0) {
      await setCache(cacheKey, topResults, 600);
    }

    res.json({
      results: topResults,
      fromCache: false,
      total: filtered.length,
      query: q,
      filters: { min, max, category, brand, sort },
    });
  } catch (err) {
    logger.error('Search error:', err.message);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// GET /api/search/price-history?url=...
const getPriceHistory = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'Product URL is required' });

    const history = await PriceHistory.findOne({ productUrl: url });
    if (!history) return res.status(404).json({ message: 'No price history found' });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get price history', error: err.message });
  }
};

module.exports = { search, getPriceHistory };
