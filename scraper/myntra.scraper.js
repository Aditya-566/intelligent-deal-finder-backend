/**
 * Myntra Scraper — Uses Myntra's internal search API for fast, reliable results.
 * Myntra's page is heavily JS-rendered so scraping HTML via render=true was slow (36s+).
 * Their internal REST API returns clean JSON directly, bypassing the JS rendering entirely.
 */

const axios = require('axios');
const { withRetry } = require('./proxy');

async function scrapeMyntra(query) {
  return withRetry(async () => {
    const apiKey = process.env.SCRAPERAPI_KEY;

    // ── Strategy 1: Myntra Internal Search API (fastest — returns JSON directly) ──
    // Myntra's search API endpoint used by their own frontend
    const apiUrl = `https://www.myntra.com/gateway/v2/search/${encodeURIComponent(query)}?p=1&rows=20&o=0&plaEnabled=false`;

    console.log(`[Myntra] Trying internal API for: "${query}"`);

    try {
      let responseData;

      if (apiKey) {
        // Route via ScraperAPI but WITHOUT render=true — just need headers spoofing
        const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(apiUrl)}&country_code=in&render=false`;
        const resp = await axios.get(scraperUrl, {
          timeout: 25000,
          headers: { 'Accept': 'application/json' }
        });
        responseData = resp.data;
      } else {
        const resp = await axios.get(apiUrl, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.myntra.com/',
            'Origin': 'https://www.myntra.com',
          },
        });
        responseData = resp.data;
      }

      // Parse Myntra API response
      const products = [];
      const items = responseData?.searchData?.results?.products ||
                    responseData?.products ||
                    responseData?.results ||
                    [];

      if (items.length > 0) {
        console.log(`[Myntra] API returned ${items.length} products`);
        items.forEach(item => {
          try {
            const brand = item.brand || item.brandName || '';
            const name = item.productType ? `${brand} ${item.productType}`.trim() : (item.productDisplayName || brand);
            if (!name) return;

            const price = parseFloat(String(item.price || item.discountedPrice || '').replace(/[^\d.]/g, ''));
            if (isNaN(price) || price <= 0) return;

            const origPrice = parseFloat(String(item.mrp || item.originalPrice || '').replace(/[^\d.]/g, '')) || null;

            const productUrl = item.landingPageUrl
              ? `https://www.myntra.com/${item.landingPageUrl}`.replace(/\/\//g, '/')
              : `https://www.myntra.com/${(item.id || '')}`;

            products.push({
              productName: name,
              price,
              originalPrice: origPrice && origPrice > price ? origPrice : null,
              imageUrl: item.searchImage || item.image || '',
              productUrl,
              source: 'Myntra',
              rating: item.rating ? parseFloat(item.rating) : null,
              reviews: item.ratingCount || null,
            });
          } catch (_) {}
        });

        if (products.length > 0) {
          console.log(`[Myntra] Successfully extracted ${products.length} products from API`);
          return products.slice(0, 15);
        }
      }
    } catch (apiErr) {
      console.warn(`[Myntra] Internal API failed (${apiErr.message}), falling back to HTML scraping`);
    }

    // ── Strategy 2: Fallback — HTML scraping with render=true (slower but reliable) ──
    const slug = query.toLowerCase().replace(/\s+/g, '-');
    const searchUrl = `https://www.myntra.com/${slug}?rawQuery=${encodeURIComponent(query)}`;
    console.log(`[Myntra] Fallback HTML scraping: ${searchUrl}`);

    let html;
    if (apiKey) {
      // Use render=false first (saves 5x credits and is 5x faster); if it fails we accept no results
      const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(searchUrl)}&country_code=in&render=false`;
      const resp = await axios.get(scraperUrl, { timeout: 25000 });
      html = resp.data;
    } else {
      const resp = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36' },
        timeout: 20000,
      });
      html = resp.data;
    }

    console.log(`[Myntra] HTML Length: ${String(html).length}`);

    // Try extracting embedded JSON from HTML (faster than DOM parsing)
    const products = [];
    const jsonPatterns = [
      /"products"\s*:\s*(\[[\s\S]*?\])/,
      /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/,
      /"searchData"[\s\S]*?"products"\s*:\s*(\[[\s\S]*?\])/,
    ];

    for (const pattern of jsonPatterns) {
      const match = String(html).match(pattern);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          const items = Array.isArray(data) ? data : (data.searchData?.results?.products || data.products || []);
          items.forEach(item => {
            try {
              const brand = item.brand || item.brandName || '';
              const name = item.productType ? `${brand} ${item.productType}`.trim() : (item.productDisplayName || brand);
              if (!name) return;
              const price = parseFloat(String(item.price || item.discountedPrice || '').replace(/[^\d.]/g, ''));
              if (isNaN(price) || price <= 0) return;
              const origPrice = parseFloat(String(item.mrp || item.originalPrice || '').replace(/[^\d.]/g, '')) || null;
              products.push({
                productName: name,
                price,
                originalPrice: origPrice && origPrice > price ? origPrice : null,
                imageUrl: item.searchImage || item.image || '',
                productUrl: `https://www.myntra.com/${item.landingPageUrl || item.id || ''}`,
                source: 'Myntra',
                rating: item.rating ? parseFloat(item.rating) : null,
                reviews: item.ratingCount || null,
              });
            } catch (_) {}
          });
          if (products.length > 0) {
            console.log(`[Myntra] Extracted ${products.length} products from embedded JSON`);
            return products.slice(0, 15);
          }
        } catch (_) {}
      }
    }

    console.log(`[Myntra] Found ${products.length} products`);
    return products.slice(0, 15);
  }, 1, 2000); // Only 1 attempt — retrying a slow scraper just doubles the wait
}

module.exports = { scrapeMyntra };
