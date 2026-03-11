/**
 * Amazon Scraper
 * Uses Puppeteer with stealth plugin to scrape Amazon search results.
 * Falls back to mock data if blocked or on error.
 */

const { getMockProducts } = require('./mockData');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeAmazon(query) {
  try {
    // Try to load puppeteer-extra with stealth
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;
    console.log(`[Amazon] Scraping: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(1500 + Math.random() * 1000);

    // Check if blocked (CAPTCHA or login page)
    const title = await page.title();
    if (title.toLowerCase().includes('robot') || title.toLowerCase().includes('captcha')) {
      console.warn('[Amazon] Detected bot protection, using mock data');
      await browser.close();
      return getMockProducts(query).filter(p => p.source === 'Amazon');
    }

    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-component-type="s-search-result"]');
      const results = [];

      items.forEach(item => {
        try {
          const nameEl = item.querySelector('h2 a span');
          const priceWholeEl = item.querySelector('.a-price-whole');
          const priceFractionEl = item.querySelector('.a-price-fraction');
          const imageEl = item.querySelector('.s-image');
          const linkEl = item.querySelector('h2 a');
          const ratingEl = item.querySelector('.a-icon-alt');
          const reviewsEl = item.querySelector('[aria-label*="stars"] + span a');
          const originalPriceEl = item.querySelector('.a-text-price span');

          if (!nameEl || !priceWholeEl) return;

          const priceStr = priceWholeEl.textContent.replace(/,/g, '') + (priceFractionEl ? `.${priceFractionEl.textContent}` : '.00');
          const price = parseFloat(priceStr);
          if (isNaN(price) || price <= 0) return;

          const originalPriceStr = originalPriceEl ? originalPriceEl.textContent.replace(/[^0-9.]/g, '') : null;
          const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : null;

          results.push({
            productName: nameEl.textContent.trim(),
            price,
            originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
            imageUrl: imageEl ? imageEl.src : '',
            productUrl: linkEl ? `https://www.amazon.com${linkEl.getAttribute('href')}` : '',
            source: 'Amazon',
            rating: ratingEl ? parseFloat(ratingEl.textContent) : null,
            reviews: reviewsEl ? parseInt(reviewsEl.textContent.replace(/,/g, '')) : null,
          });
        } catch (e) { /* skip malformed item */ }
      });

      return results.slice(0, 10);
    });

    await browser.close();
    console.log(`[Amazon] Found ${products.length} products`);
    return products;
  } catch (err) {
    console.error('[Amazon] Scrape failed:', err.message);
    return getMockProducts(query).filter(p => p.source === 'Amazon');
  }
}

module.exports = { scrapeAmazon };
