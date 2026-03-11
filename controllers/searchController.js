const scraperService = require('../scraper/scraper.service');
const PriceHistory = require('../models/PriceHistory');
const cache = require('../utils/cache');

// GET /api/search
const search = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, brand, sortBy } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 999999;
    const sort = sortBy || 'price';

    // Check cache
    const cacheKey = `search:${q}:${min}:${max}:${category || ''}:${brand || ''}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('⚡ Serving from cache:', cacheKey);
      return res.json({ results: cached, fromCache: true, total: cached.length });
    }

    console.log(`🔍 Searching for: "${q}" | Budget: $${min} - $${max}`);

    // Run scrapers
    const allProducts = await scraperService.scrapeAll(q, { category, brand });

    // Filter by budget
    let filtered = allProducts.filter(p => p.price >= min && p.price <= max);

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
    } else {
      filtered.sort((a, b) => a.price - b.price);
    }

    // Top 5
    const top5 = filtered.slice(0, 5);

    // Store price history for top results
    for (const product of top5) {
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

    // Cache results for 5 minutes
    cache.set(cacheKey, top5);

    res.json({
      results: top5,
      fromCache: false,
      total: filtered.length,
      query: q,
      filters: { min, max, category, brand, sort },
    });
  } catch (err) {
    console.error('Search error:', err.message);
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
