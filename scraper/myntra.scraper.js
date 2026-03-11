/**
 * Myntra Scraper
 * Uses Puppeteer (Myntra requires JS rendering) to scrape search results.
 * Falls back to mock data on error or block.
 */

const { getMockProducts } = require('./mockData');
const { getRandomUserAgent } = require('./proxy');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeMyntra(query) {
  try {
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
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1366, height: 768 });

    const searchUrl = `https://www.myntra.com/${encodeURIComponent(query.replace(/\s+/g, '-'))}?rawQuery=${encodeURIComponent(query)}`;
    console.log(`[Myntra] Scraping: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(2000 + Math.random() * 1000);

    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('.product-base, li.product-base');
      const results = [];

      items.forEach(item => {
        try {
          const brandEl = item.querySelector('.product-brand');
          const nameEl = item.querySelector('.product-product');
          const priceEl = item.querySelector('.product-discountedPrice');
          const origPriceEl = item.querySelector('.product-strike');
          const imageEl = item.querySelector('img.img-responsive, .product-imageSlider img');
          const linkEl = item.querySelector('a');

          const brand = brandEl ? brandEl.textContent.trim() : '';
          const name = nameEl ? nameEl.textContent.trim() : '';
          const fullName = brand && name ? `${brand} ${name}` : (brand || name);
          if (!fullName) return;

          const priceStr = priceEl ? priceEl.textContent.replace(/[₹,\s]/g, '') : '';
          const price = parseFloat(priceStr);
          if (isNaN(price) || price <= 0) return;

          const origPriceStr = origPriceEl ? origPriceEl.textContent.replace(/[₹,\s]/g, '') : '';
          const originalPrice = parseFloat(origPriceStr) || null;

          const href = linkEl ? linkEl.getAttribute('href') : '';
          const productUrl = href.startsWith('http') ? href : `https://www.myntra.com/${href}`;

          // Keep as INR
          const priceINR = parseFloat(price.toFixed(2));
          const origPriceINR = originalPrice ? parseFloat(originalPrice.toFixed(2)) : null;

          results.push({
            productName: fullName,
            price: priceINR,
            originalPrice: origPriceINR && origPriceINR > priceINR ? origPriceINR : null,
            imageUrl: imageEl ? (imageEl.src || imageEl.dataset.src || '') : '',
            productUrl,
            source: 'Myntra',
            rating: null,
            reviews: null,
          });
        } catch (e) { /* skip */ }
      });

      return results.slice(0, 10);
    });

    await browser.close();
    console.log(`[Myntra] Found ${products.length} products`);

    if (products.length === 0) return getMockProducts(query).filter(p => p.source === 'Myntra');
    return products;
  } catch (err) {
    console.error('[Myntra] Scrape failed:', err.message);
    return getMockProducts(query).filter(p => p.source === 'Myntra');
  }
}

module.exports = { scrapeMyntra };
