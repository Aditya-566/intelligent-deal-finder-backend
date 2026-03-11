/**
 * Flipkart Scraper
 * Uses Cheerio + axios to scrape Flipkart search results.
 * Falls back to mock data on error or block.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getMockProducts } = require('./mockData');
const { getRandomUserAgent } = require('./proxy');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeFlipkart(query) {
  try {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&marketplace=FLIPKART`;
    console.log(`[Flipkart] Scraping: ${searchUrl}`);

    await delay(600 + Math.random() * 600);

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(data);
    const products = [];

    // Flipkart uses multiple layouts – try both grid and list selectors
    const selectors = [
      // Grid layout (most common)
      { container: '._1AtVbE', name: '._4rR01T,.s1Q9rs,.IRpwTa', price: '._30jeq3,._3I9_wc', image: '._396cs4,._2r_T1I', link: 'a._1fQZEK,a.s1Q9rs,a._2rpwqI' },
      // List layout
      { container: '._13oc-S', name: '.col-7-12 ._35KyD6', price: '._30jeq3', image: 'img._2r_T1I', link: 'a._31qSD5' },
    ];

    for (const sel of selectors) {
      $(sel.container).each((i, el) => {
        if (products.length >= 10) return false;
        try {
          const nameEl = $(el).find(sel.name).first();
          const priceEl = $(el).find(sel.price).first();
          const imageEl = $(el).find('img').first();
          const linkEl = $(el).find('a[href*="/p/"]').first();

          const name = nameEl.text().trim();
          const priceText = priceEl.text().replace(/[₹,\s]/g, '');
          const price = parseFloat(priceText);

          if (!name || isNaN(price) || price <= 0) return;

          // Original price (strikethrough)
          const origPriceEl = $(el).find('._3I9_wc').first();
          const origPriceText = origPriceEl.text().replace(/[₹,\s]/g, '');
          const originalPrice = parseFloat(origPriceText) || null;

          const href = linkEl.attr('href') || '';
          const productUrl = href.startsWith('http') ? href : `https://www.flipkart.com${href}`;

          // Keep as INR
          const priceINR = parseFloat(price.toFixed(2));
          const origPriceINR = originalPrice ? parseFloat(originalPrice.toFixed(2)) : null;

          if (productUrl.includes('/p/')) {
            products.push({
              productName: name,
              price: priceINR,
              originalPrice: origPriceINR && origPriceINR > priceINR ? origPriceINR : null,
              imageUrl: imageEl.attr('src') || imageEl.attr('data-src') || '',
              productUrl,
              source: 'Flipkart',
              rating: null,
              reviews: null,
            });
          }
        } catch (e) { /* skip malformed */ }
      });
      if (products.length > 0) break;
    }

    console.log(`[Flipkart] Found ${products.length} products`);
    if (products.length === 0) return getMockProducts(query).filter(p => p.source === 'Flipkart');
    return products.slice(0, 10);
  } catch (err) {
    console.error('[Flipkart] Scrape failed:', err.message);
    return getMockProducts(query).filter(p => p.source === 'Flipkart');
  }
}

module.exports = { scrapeFlipkart };
