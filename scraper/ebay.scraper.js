/**
 * eBay Scraper
 * Uses Cheerio + axios (eBay search pages are mostly static HTML).
 * Falls back to mock data on error.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getMockProducts } = require('./mockData');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeEbay(query) {
  try {
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&LH_BIN=1`;
    console.log(`[eBay] Scraping: ${searchUrl}`);

    await delay(800 + Math.random() * 700);

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(data);
    const products = [];

    $('.s-item').each((i, el) => {
      if (i === 0) return; // First item is always a template
      try {
        const name = $(el).find('.s-item__title').text().trim();
        if (!name || name === 'Shop on eBay') return;

        const priceText = $(el).find('.s-item__price').first().text().trim();
        const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
        if (!priceMatch) return;
        const price = parseFloat(priceMatch[1].replace(/,/g, ''));
        if (isNaN(price) || price <= 0) return;

        const link = $(el).find('.s-item__link').attr('href') || '';
        const image = $(el).find('.s-item__image-img').attr('src') || $(el).find('.s-item__image-img').attr('data-src') || '';
        const ratingText = $(el).find('.x-star-rating').text().trim();
        const rating = ratingText ? parseFloat(ratingText) : null;

        // Check for original/strikethrough price
        const originalPriceText = $(el).find('.ITALIC').text().trim() || $(el).find('.s-item__strike_price').text().trim();
        const originalPriceMatch = originalPriceText.match(/\$?([\d,]+\.?\d*)/);
        const originalPrice = originalPriceMatch ? parseFloat(originalPriceMatch[1].replace(/,/g, '')) : null;

        products.push({
          productName: name.replace(/^New Listing\s*/, ''),
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
          imageUrl: image,
          productUrl: link.split('?')[0], // Clean URL
          source: 'eBay',
          rating,
          reviews: null,
        });
      } catch (e) { /* skip */ }
    });

    console.log(`[eBay] Found ${products.length} products`);
    if (products.length === 0) return getMockProducts(query).filter(p => p.source === 'eBay');
    return products.slice(0, 10);
  } catch (err) {
    console.error('[eBay] Scrape failed:', err.message);
    return getMockProducts(query).filter(p => p.source === 'eBay');
  }
}

module.exports = { scrapeEbay };
