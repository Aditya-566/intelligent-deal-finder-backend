/**
 * Flipkart Scraper (ScraperAPI + Cheerio)
 * Uses multiple selector strategies to handle Flipkart's frequently-changing class names.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { withRetry } = require('./proxy');

async function scrapeFlipkart(query) {
  return withRetry(async () => {
    const apiKey = process.env.SCRAPERAPI_KEY;
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&marketplace=FLIPKART`;
    console.log(`[Flipkart] Scraping: ${searchUrl}`);

    let html;
    if (apiKey) {
      // render=false is enough for Flipkart SSR pages; saves credits
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(searchUrl)}&country_code=in&render=false`;
      const resp = await axios.get(scraperUrl, { timeout: 60000 });
      html = resp.data;
    } else {
      const resp = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36' },
        timeout: 30000,
      });
      html = resp.data;
    }

    console.log(`[Flipkart] HTML Length: ${String(html).length}`);
    const $ = cheerio.load(html);
    const products = [];
    const seen = new Set();

    // ── Strategy 1: data-id product cards (most reliable) ────────────────────
    $('[data-id]').each((_, el) => {
      try {
        parseFlipkartItem($, $(el), products, seen);
      } catch (_) {}
    });

    // ── Strategy 2: Common product wrapper class names ────────────────────────
    if (products.length === 0) {
      const selectors = [
        '._1AtVbE', '._2kHMtA', '.cPHDOP', '._4ddWXP',
        '._13oc-S', '._1xHGtK', '._2B099V', '.col.col-7-12',
        '._1YokD2', 'div[class*="product"]',
      ];
      for (const sel of selectors) {
        $(sel).each((_, el) => {
          try {
            parseFlipkartItem($, $(el), products, seen);
          } catch (_) {}
        });
        if (products.length > 0) break;
      }
    }

    // ── Strategy 3: Find all links to /p/ product pages and extract nearby data
    if (products.length === 0) {
      $('a[href*="/p/"]').each((_, el) => {
        try {
          const item = $(el).closest('div').parent();
          parseFlipkartItem($, item, products, seen);
        } catch (_) {}
      });
    }

    console.log(`[Flipkart] Found ${products.length} products`);
    return products.slice(0, 10);
  }, 2, 3000);
}

/**
 * Attempts to extract a product from a Flipkart DOM element using multiple selector strategies.
 */
function parseFlipkartItem($, item, products, seen) {
  // Name — try many known class names
  const nameSelectors = [
    '.KzDlHZ', '._4rR01T', '.s1Q9rs', '.IRpwO_', '.WKTcLC',
    '._2WkVRV', '.wY699G', 'a[title]', 'div[title]',
  ];
  let name = '';
  for (const sel of nameSelectors) {
    name = item.find(sel).first().text().trim();
    if (name) break;
  }
  // fallback: title attribute on a link
  if (!name) name = item.find('a[href*="/p/"]').first().attr('title') || '';
  if (!name) return;

  // Price — try known price class names
  const priceSelectors = ['.Nx9bqj', '._30jeq3', '._1_WHN1', '._16J6S6', '.a-price'];
  let priceText = '';
  for (const sel of priceSelectors) {
    priceText = item.find(sel).first().text();
    if (priceText) break;
  }
  if (!priceText) {
    const match = item.text().match(/₹[\d,]+/);
    if (match) priceText = match[0];
  }
  const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
  if (isNaN(price) || price <= 0) return;

  // Original price
  const origSelectors = ['.yRaY8j', '._3I9_ca', '._2p6Z04', '.sV_BG'];
  let origText = '';
  for (const sel of origSelectors) {
    origText = item.find(sel).first().text();
    if (origText) break;
  }
  const originalPrice = parseFloat(origText.replace(/[^\d.]/g, '')) || null;

  // Image
  let imageUrl = item.find('img').first().attr('src') || item.find('img').first().attr('data-src') || '';
  if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;

  // URL
  const href = item.find('a[href*="/p/"]').first().attr('href') || '';
  if (!href) return;
  const productUrl = href.startsWith('http') ? href : `https://www.flipkart.com${href}`;

  // Deduplicate
  if (seen.has(productUrl)) return;
  seen.add(productUrl);

  products.push({
    productName: name,
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
    imageUrl,
    productUrl,
    source: 'Flipkart',
    rating: null,
    reviews: null,
  });
}

module.exports = { scrapeFlipkart };
