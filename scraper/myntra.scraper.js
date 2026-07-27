/**
 * Myntra Scraper (ScraperAPI + Cheerio)
 * Myntra is heavily JS-rendered; we use ScraperAPI with render=true.
 * Falls back to extracting JSON from embedded __NEXT_DATA__ / window.__STATE__ if available.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { withRetry } = require('./proxy');

async function scrapeMyntra(query) {
  return withRetry(async () => {
    const apiKey = process.env.SCRAPERAPI_KEY;
    const slug = query.toLowerCase().replace(/\s+/g, '-');
    const searchUrl = `https://www.myntra.com/${slug}?rawQuery=${encodeURIComponent(query)}`;
    console.log(`[Myntra] Scraping: ${searchUrl}`);

    let html;
    if (apiKey) {
      // render=true needed for Myntra's JS-rendered pages (costs 5 credits vs 1)
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(searchUrl)}&country_code=in&render=true`;
      const resp = await axios.get(scraperUrl, { timeout: 60000 });
      html = resp.data;
    } else {
      const resp = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36' },
        timeout: 30000,
      });
      html = resp.data;
    }

    console.log(`[Myntra] HTML Length: ${String(html).length}`);
    const $ = cheerio.load(html);
    const products = [];

    // ── Strategy 1: Extract from embedded __NEXT_DATA__ or window.__STATE__ JSON ──
    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
      const content = $(script).html() || '';
      // Try to find product arrays in embedded JSON
      const jsonMatch = content.match(/"products"\s*:\s*(\[[\s\S]*?\])/);
      if (jsonMatch) {
        try {
          const items = JSON.parse(jsonMatch[1]);
          items.forEach(item => {
            try {
              const name = `${item.brand || ''} ${item.productType || item.name || ''}`.trim();
              if (!name) return;
              const price = parseFloat(String(item.price || item.discountedPrice || '').replace(/[^\d.]/g, ''));
              if (isNaN(price) || price <= 0) return;
              const origPrice = parseFloat(String(item.mrp || item.originalPrice || '').replace(/[^\d.]/g, '')) || null;
              products.push({
                productName: name,
                price,
                originalPrice: origPrice && origPrice > price ? origPrice : null,
                imageUrl: item.image || item.searchImage || '',
                productUrl: `https://www.myntra.com/${item.landingPageUrl || ''}`,
                source: 'Myntra',
                rating: item.rating ? parseFloat(item.rating) : null,
                reviews: item.ratingCount || null,
              });
            } catch (_) {}
          });
          if (products.length > 0) {
            console.log(`[Myntra] Extracted ${products.length} products from embedded JSON`);
            return products.slice(0, 10);
          }
        } catch (_) {}
      }
    }

    // ── Strategy 2: HTML class-based selectors ────────────────────────────────
    const cardSelectors = ['.product-base', '.product-item', '._1YokD2', 'li.product-base', 'div[class*="product"]'];
    let $cards = $();
    for (const sel of cardSelectors) {
      $cards = $(sel);
      if ($cards.length > 0) break;
    }

    $cards.each((_, el) => {
      try {
        const item = $(el);

        const brand = item.find('.product-brand, .brand-name').text().trim();
        const productPart = item.find('.product-product, .product-name, .product-description').text().trim();
        const name = brand ? `${brand} ${productPart}` : productPart;
        if (!name) return;

        let priceText = item.find('.product-discountedPrice, .discounted-price, .price-actual').text();
        if (!priceText) priceText = item.find('.product-price').text();
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        if (isNaN(price) || price <= 0) return;

        const origText = item.find('.product-strike, .original-price').text();
        const originalPrice = parseFloat(origText.replace(/[^\d.]/g, '')) || null;

        const imgEl = item.find('img');
        const imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';

        const href = item.find('a').first().attr('href') || '';
        const productUrl = href.startsWith('http') ? href : `https://www.myntra.com/${href.replace(/^\//, '')}`;

        products.push({
          productName: name,
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
          imageUrl,
          productUrl,
          source: 'Myntra',
          rating: null,
          reviews: null,
        });
      } catch (_) {}
    });

    console.log(`[Myntra] Found ${products.length} products`);
    return products.slice(0, 10);
  }, 2, 3000);
}

module.exports = { scrapeMyntra };
