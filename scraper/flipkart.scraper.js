/**
 * Flipkart Scraper (ScraperAPI + Cheerio)
 * Scrapes flipkart.com using ScraperAPI to bypass bot protections.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getProxiedUrl, withRetry } = require('./proxy');

async function scrapeFlipkart(query) {
  return withRetry(async () => {
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&marketplace=FLIPKART`;
    const proxiedUrl = getProxiedUrl(searchUrl, false, true); // Flipkart reliably needs rendering for search items
    
    console.log(`[Flipkart] Scraping via ScraperAPI: ${searchUrl}`);

    const { data } = await axios.get(proxiedUrl, { timeout: 60000 });
    console.log(`[Flipkart] HTML Length: ${data.length}`);

    const $ = cheerio.load(data);
    const products = [];

    // Flipkart search results selector - checking both list and grid views
    $('div[data-id], .cPHDOP, ._1AtVbE, ._75nlfW').each((i, el) => {
      try {
        const item = $(el);
        const asin = item.attr('data-id');
        
        // Try known name classes, fallback to first major a-tag or text
        let name = item.find('.KzDlHZ, .wY699G, ._4rR01T, .IRpwO_').first().text().trim();
        if (!name) {
          const mainLink = item.find('a[href*="/p/"]').first();
          name = mainLink.text().trim();
        }
        // Clean "Currently unavailable" etc if it's at start
        name = name.replace(/Currently unavailable|Add to Compare/g, '').trim();
        if (!name) return;

        // Price extraction: try selectors first, then text search
        let priceText = item.find('.Nx9bqj, ._16J6S6, ._30jeq3').first().text();
        if (!priceText) {
          const match = item.text().match(/₹[\d,]+/);
          if (match) priceText = match[0];
        }

        const priceClean = priceText.replace(/[^\d]/g, '');
        const price = parseFloat(priceClean);
        if (isNaN(price) || price <= 0) return;

        const origPriceEl = item.find('.yRaY8j, ._3I9_ca').first();
        const origPriceClean = origPriceEl.text().replace(/[^\d]/g, '');
        const originalPrice = parseFloat(origPriceClean) || null;

        const imageEl = item.find('img').first();
        let image = imageEl.attr('src') || imageEl.attr('data-src') || '';
        if(image.startsWith('//')) image = 'https:' + image;
        
        const linkEl = item.find('a[href*="/p/"]').first();
        const href = linkEl.attr('href') || '';
        const productUrl = href.startsWith('http') ? href : `https://www.flipkart.com${href}`;

        products.push({
            productName: name,
            price: price,
            originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
            imageUrl: image,
            productUrl: productUrl,
            source: 'Flipkart',
            rating: null,
            reviews: null,
          });
      } catch (e) { /* skip */ }
    });

    console.log(`[Flipkart] Found ${products.length} relevant products`);
    return products.slice(0, 10);
  }, 2, 2000);
}

module.exports = { scrapeFlipkart };
