/**
 * Walmart Scraper
 * Uses Puppeteer with stealth plugin to scrape Walmart search results.
 * Falls back to mock data if blocked or on error.
 */

const { getMockProducts } = require('./mockData');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function scrapeWalmart(query) {
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
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
    console.log(`[Walmart] Scraping: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000 + Math.random() * 1000);

    // Check if blocked
    const title = await page.title();
    if (title.toLowerCase().includes('access denied') || title.toLowerCase().includes('robot')) {
      console.warn('[Walmart] Detected bot protection, using mock data');
      await browser.close();
      return getMockProducts(query).filter(p => p.source === 'Walmart');
    }

    const products = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-item-id], [data-testid="list-view"]');
      const results = [];

      // Try multiple selector patterns
      const cards = document.querySelectorAll('.sans-serif.mid-gray');
      const productCards = document.querySelectorAll('[data-automation-id="product"]') ||
        document.querySelectorAll('.search-result-gridview-item');

      const allCards = [...document.querySelectorAll('[role="group"]'),
        ...document.querySelectorAll('.search-result-listview-item-wrapper')];

      allCards.forEach(card => {
        try {
          const nameEl = card.querySelector('[data-automation-id="product-title"] span') ||
            card.querySelector('.w_V_DM') ||
            card.querySelector('[class*="f7"], [class*="title"]');
          const priceEl = card.querySelector('[itemprop="price"]') ||
            card.querySelector('[data-automation-id="product-price"] .w_iUH7') ||
            card.querySelector('.w_iUH7');
          const imgEl = card.querySelector('img[loading="lazy"]') || card.querySelector('img');
          const linkEl = card.querySelector('a[link-identifier]') || card.querySelector('a[href*="/ip/"]');

          if (!nameEl || !priceEl) return;

          const priceText = priceEl.getAttribute('content') || priceEl.textContent.replace(/[^0-9.]/g, '');
          const price = parseFloat(priceText);
          if (isNaN(price) || price <= 0) return;

          results.push({
            productName: nameEl.textContent.trim(),
            price,
            originalPrice: null,
            imageUrl: imgEl ? (imgEl.src || imgEl.dataset.src) : '',
            productUrl: linkEl ? `https://www.walmart.com${linkEl.getAttribute('href')}` : '',
            source: 'Walmart',
            rating: null,
            reviews: null,
          });
        } catch (e) { /* skip */ }
      });

      return results.filter(p => p.productName && p.price > 0).slice(0, 10);
    });

    await browser.close();
    console.log(`[Walmart] Found ${products.length} products`);
    if (products.length === 0) return getMockProducts(query).filter(p => p.source === 'Walmart');
    return products;
  } catch (err) {
    console.error('[Walmart] Scrape failed:', err.message);
    return getMockProducts(query).filter(p => p.source === 'Walmart');
  }
}

module.exports = { scrapeWalmart };
