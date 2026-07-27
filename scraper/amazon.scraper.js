/**
 * Amazon Scraper
 * Uses ScraperAPI's structured Amazon search endpoint for reliable data extraction.
 * Docs: https://docs.scraperapi.com/making-requests/structured-data/amazon
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { withRetry } = require('./proxy');

async function scrapeAmazon(query) {
  return withRetry(async () => {
    const apiKey = process.env.SCRAPERAPI_KEY;

    // ── Try ScraperAPI structured Amazon endpoint first ──────────────────────
    if (apiKey) {
      try {
        console.log(`[Amazon] Using ScraperAPI structured endpoint for: "${query}"`);
        const response = await axios.get('https://api.scraperapi.com/structured/amazon/search', {
          params: {
            api_key: apiKey,
            query: query,
            country: 'in',
          },
          timeout: 60000,
        });

        const data = response.data;
        const results = data.results || data.organic_results || data.search_results || [];

        console.log(`[Amazon] Structured API returned ${results.length} results`);

        const products = results
          .filter(item => item.name || item.title)
          .map(item => {
            // Price can come in various formats
            const priceRaw = item.price || item.price_string || '';
            const priceClean = String(priceRaw).replace(/[^0-9.]/g, '');
            const price = parseFloat(priceClean);

            const origRaw = item.original_price || item.list_price || '';
            const origClean = String(origRaw).replace(/[^0-9.]/g, '');
            const originalPrice = parseFloat(origClean) || null;

            const productUrl = item.url || item.link || item.asin
              ? `https://www.amazon.in/dp/${item.asin}`
              : '';

            return {
              productName: item.name || item.title,
              price: isNaN(price) ? null : price,
              originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
              imageUrl: item.image || item.thumbnail || '',
              productUrl: item.url || item.link || productUrl,
              source: 'Amazon',
              rating: item.rating ? parseFloat(item.rating) : null,
              reviews: item.reviews || item.reviews_count || null,
            };
          })
          .filter(p => p.price && p.price > 0 && p.productName);

        console.log(`[Amazon] Found ${products.length} valid products`);
        return products.slice(0, 10);

      } catch (structuredErr) {
        console.warn(`[Amazon] Structured endpoint failed (${structuredErr.message}), falling back to HTML scraping`);
      }
    }

    // ── Fallback: HTML scraping via ScraperAPI proxy ────────────────────────
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    console.log(`[Amazon] HTML scraping: ${searchUrl}`);

    let html;
    if (apiKey) {
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(searchUrl)}&country_code=in`;
      const resp = await axios.get(scraperUrl, { timeout: 60000 });
      html = resp.data;
    } else {
      const resp = await axios.get(searchUrl, { timeout: 30000 });
      html = resp.data;
    }

    console.log(`[Amazon] HTML Length: ${String(html).length}`);
    const $ = cheerio.load(html);
    const products = [];

    $('.s-result-item[data-asin]').each((i, el) => {
      try {
        const asin = $(el).attr('data-asin');
        if (!asin || asin.length < 5) return;

        const name = $(el).find('h2 span, h2 a span').first().text().trim();
        if (!name) return;

        const priceWhole = $(el).find('.a-price-whole').first().text().replace(/[^\d]/g, '');
        const price = parseFloat(priceWhole);
        if (isNaN(price) || price <= 0) return;

        const origPriceStr = $(el).find('.a-text-price span[aria-hidden="true"]').first().text().replace(/[^\d]/g, '');
        const originalPrice = parseFloat(origPriceStr) || null;

        const imageUrl = $(el).find('img.s-image').attr('src') || '';
        const linkHref = $(el).find('h2 a, a.a-link-normal.s-no-outline').first().attr('href') || '';
        const productUrl = linkHref.startsWith('http') ? linkHref : `https://www.amazon.in${linkHref}`;

        const ratingText = $(el).find('.a-icon-alt').first().text();
        const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : null;

        products.push({ productName: name, price, originalPrice: originalPrice && originalPrice > price ? originalPrice : null, imageUrl, productUrl, source: 'Amazon', rating, reviews: null });
      } catch (_) {}
    });

    console.log(`[Amazon] HTML scrape found ${products.length} products`);
    return products.slice(0, 10);

  }, 2, 3000);
}

module.exports = { scrapeAmazon };
