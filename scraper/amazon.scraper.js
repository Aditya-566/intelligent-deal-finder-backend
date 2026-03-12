/**
 * Amazon Scraper (ScraperAPI + Cheerio)
 * Scrapes amazon.in using ScraperAPI to bypass bot protections.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getProxiedUrl, withRetry } = require('./proxy');

async function scrapeAmazon(query) {
  return withRetry(async () => {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const proxiedUrl = getProxiedUrl(searchUrl, false, true); // Amazon definitely needs rendering for full results
    
    console.log(`[Amazon] Scraping via ScraperAPI: ${searchUrl}`);

    try {
      const { data } = await axios.get(proxiedUrl, { timeout: 60000 });
      console.log(`[Amazon] HTML Length: ${data.length}`);
      
      const $ = cheerio.load(data);
      const products = [];

      // Amazon search results selector
      $('.s-result-item').each((i, el) => {
        try {
          const asin = $(el).attr('data-asin');
          if (!asin || asin.length < 5) return;

          const nameEl = $(el).find('h2');
          const priceWholeEl = $(el).find('.a-price-whole').first();
          const imageEl = $(el).find('img.s-image');
          const linkEl = $(el).find('a.a-link-normal.s-no-outline, a.a-link-normal.s-underline-text.s-underline-link-text, h2 a').first();
          const ratingEl = $(el).find('.a-icon-alt');
          const reviewsEl = $(el).find('.a-size-base.s-underline-text');
          const originalPriceEl = $(el).find('.a-text-price span').first();

          const name = nameEl.text().trim();
          if (!name) return;

          // Price cleaning
          const priceClean = priceWholeEl.text().replace(/[^\d]/g, '');
          const price = parseFloat(priceClean);
          // Allow items with price if we want, but Amazon sometimes has ads without prices
          if (isNaN(price)) return;

          const originalPriceStr = originalPriceEl.length ? originalPriceEl.text().replace(/[^\d]/g, '') : null;
          const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : null;

          const productUrlRaw = linkEl.attr('href') || '';
          const productUrl = productUrlRaw.startsWith('http') ? productUrlRaw : `https://www.amazon.in${productUrlRaw}`;

          products.push({
            productName: name,
            price: price,
            originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
            imageUrl: imageEl.attr('src') || '',
            productUrl,
            source: 'Amazon',
            rating: ratingEl.length ? parseFloat(ratingEl.text().split(' ')[0]) : null,
            reviews: reviewsEl.length ? parseInt(reviewsEl.first().text().replace(/[^\d]/g, '')) : null,
          });
        } catch (err) { /* skip */ }
      });

      console.log(`[Amazon] Found ${products.length} relevant products`);
      return products.slice(0, 10);
    } catch (err) {
      if (err.response) {
          console.error('[Amazon Axios Error]:', err.response.status, err.response.data);
      } else {
          console.error('[Amazon Error]:', err.message);
      }
      throw err;
    }
  }, 2, 2000); // 2 attempts maximum
}

module.exports = { scrapeAmazon };
