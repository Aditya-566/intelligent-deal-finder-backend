/**
 * Myntra Scraper (ScraperAPI + Cheerio)
 * Scrapes myntra.com using ScraperAPI to bypass bot protections.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { getProxiedUrl, withRetry } = require('./proxy');

async function scrapeMyntra(query) {
  return withRetry(async () => {
    const searchUrl = `https://www.myntra.com/${encodeURIComponent(query.replace(/\s+/g, '-'))}?rawQuery=${encodeURIComponent(query)}`;
    const proxiedUrl = getProxiedUrl(searchUrl, false, true); // Myntra heavily relies on React rendering
    
    console.log(`[Myntra] Scraping via ScraperAPI: ${searchUrl}`);

    const { data } = await axios.get(proxiedUrl, { timeout: 45000 });
    const $ = cheerio.load(data);
    const products = [];

    // Myntra uses list items for products
    // Myntra uses list items or divs with class .product-base
    $('.product-base').each((i, el) => {
      try {
        const item = $(el);
        const brand = item.find('.product-brand').text().trim();
        const productNamePart = item.find('.product-product').text().trim();
        const fullName = brand ? `${brand} ${productNamePart}` : productNamePart;
        
        if (!fullName) return;

        // Skip Relevance Filtering for debugging or if specific enough
        // const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        // const nameLower = fullName.toLowerCase();
        // const isRelevant = queryTokens.every(token => nameLower.includes(token));
        // if (!isRelevant) return;

        const priceEl = item.find('.product-discountedPrice');
        const priceText = priceEl.text() || item.find('.product-price').text();
        const priceClean = priceText.replace(/[^\d]/g, '');
        const price = parseFloat(priceClean);
        if (isNaN(price) || price <= 0) return;

        const origPriceEl = item.find('.product-strike');
        const origPriceClean = origPriceEl.text().replace(/[^\d]/g, '');
        const originalPrice = parseFloat(origPriceClean) || null;

        const imgEl = item.find('img');
        const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
        
        const href = item.find('a').attr('href') || '';
        const productUrl = href.startsWith('http') ? href : `https://www.myntra.com/${href}`;

        products.push({
          productName: fullName,
          price: price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
          imageUrl,
          productUrl,
          source: 'Myntra',
          rating: null,
          reviews: null,
        });
      } catch (e) {
        // skip malformed item
      }
    });

    console.log(`[Myntra] Found ${products.length} relevant products`);
    return products.slice(0, 10);
  }, 2, 2000);
}

module.exports = { scrapeMyntra };
