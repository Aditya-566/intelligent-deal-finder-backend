/**
 * Mock/fallback data for when scrapers are blocked.
 * Provides realistic product data for demonstration.
 */

const mockProducts = {
  laptop: [
    { productName: 'Lenovo IdeaPad 3 15.6" Laptop, Intel Core i5, 8GB RAM, 256GB SSD', price: 449.99, originalPrice: 549.99, imageUrl: 'https://m.media-amazon.com/images/I/71XP9f6OPHL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0922GRG2X', source: 'Amazon', rating: 4.4, reviews: 3241 },
    { productName: 'HP 15 Laptop, Intel Core i3-1115G4, 8GB DDR4, 256GB SSD', price: 379.99, originalPrice: 429.99, imageUrl: 'https://m.media-amazon.com/images/I/61fk5OOyKuL._AC_UY218_.jpg', productUrl: 'https://www.ebay.com/itm/3040384920', source: 'eBay', rating: 4.2, reviews: 1856 },
    { productName: 'Acer Aspire 5 A515-56-36UT Slim Laptop, 15.6" Full HD IPS', price: 499.99, originalPrice: 599.99, imageUrl: 'https://m.media-amazon.com/images/I/71T9h6Mkc6L._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Acer-Aspire-5/123456789', source: 'Walmart', rating: 4.5, reviews: 5120 },
    { productName: 'ASUS VivoBook 15 Laptop, 15.6" FHD, AMD Ryzen 5 5500U', price: 529.99, originalPrice: 649.99, imageUrl: 'https://m.media-amazon.com/images/I/71M+o7B2NwL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0922GRG2Y', source: 'Amazon', rating: 4.3, reviews: 2103 },
    { productName: 'Dell Inspiron 15 3000 Laptop, Intel Core i5-1135G7, 8GB RAM', price: 559.00, originalPrice: 699.00, imageUrl: 'https://m.media-amazon.com/images/I/71s0tE1FCJL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Dell-Inspiron-15/987654321', source: 'Walmart', rating: 4.1, reviews: 978 },
  ],
  headphones: [
    { productName: 'Sony WH-1000XM4 Wireless Noise Canceling Overhead Headphones', price: 279.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0863TXGM3', source: 'Amazon', rating: 4.8, reviews: 45210 },
    { productName: 'Bose QuietComfort 45 Bluetooth Wireless Noise Canceling Headphones', price: 249.00, originalPrice: 329.00, imageUrl: 'https://m.media-amazon.com/images/I/51oXBb7JHBL._AC_UY218_.jpg', productUrl: 'https://www.ebay.com/itm/headphones-bose', source: 'eBay', rating: 4.7, reviews: 12400 },
    { productName: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds', price: 189.99, originalPrice: 249.00, imageUrl: 'https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Apple-AirPods-Pro-2nd-Gen/789012345', source: 'Walmart', rating: 4.9, reviews: 89000 },
    { productName: 'JBL Tune 760NC Wireless Over-Ear Headphones with Noise Canceling', price: 79.95, originalPrice: 129.95, imageUrl: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B08PHSTN7T', source: 'Amazon', rating: 4.5, reviews: 22000 },
    { productName: 'Anker Soundcore Life Q45 Adaptive Noise Canceling Headphones', price: 59.99, originalPrice: 99.99, imageUrl: 'https://m.media-amazon.com/images/I/61RyOFAuGWL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Anker-Soundcore-Life/345678901', source: 'Walmart', rating: 4.4, reviews: 9870 },
  ],
  phone: [
    { productName: 'Samsung Galaxy S23 FE 5G Cell Phone, 128GB Unlocked Android', price: 399.99, originalPrice: 499.99, imageUrl: 'https://m.media-amazon.com/images/I/71byblRHscL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0CGYY3KTM', source: 'Amazon', rating: 4.5, reviews: 8200 },
    { productName: 'Apple iPhone 14 128GB (Blue) - Unlocked', price: 699.00, originalPrice: 829.00, imageUrl: 'https://m.media-amazon.com/images/I/61cwywLZR-L._AC_UY218_.jpg', productUrl: 'https://www.ebay.com/itm/iphone-14', source: 'eBay', rating: 4.7, reviews: 32100 },
    { productName: 'Google Pixel 7a - 5G Android Phone, 128GB, Unlocked', price: 349.00, originalPrice: 499.00, imageUrl: 'https://m.media-amazon.com/images/I/61HN5p3TaEL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Google-Pixel-7a/234567890', source: 'Walmart', rating: 4.6, reviews: 11200 },
    { productName: 'OnePlus 12R 5G, 256GB, Unlocked, Cool Blue', price: 449.99, originalPrice: 599.99, imageUrl: 'https://m.media-amazon.com/images/I/71a+fAqCjoL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/oneplus-12r', source: 'Amazon', rating: 4.4, reviews: 4500 },
    { productName: 'Motorola Moto G 5G (2023) - 128GB, Unlocked, Ink Blue', price: 179.99, originalPrice: 249.99, imageUrl: 'https://m.media-amazon.com/images/I/61bCT5kWLxL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Motorola-Moto-G-5G/456789012', source: 'Walmart', rating: 4.2, reviews: 3100 },
  ],
  watch: [
    { productName: 'Apple Watch Series 9 [GPS 41mm] Smartwatch with Starlight Aluminum', price: 329.00, originalPrice: 399.00, imageUrl: 'https://m.media-amazon.com/images/I/71XH+2xt4sL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/apple-watch-s9', source: 'Amazon', rating: 4.8, reviews: 22000 },
    { productName: 'Samsung Galaxy Watch 6 Classic 43mm Smartwatch, Graphite', price: 249.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/7175jmwbCHL._AC_UY218_.jpg', productUrl: 'https://www.ebay.com/itm/galaxy-watch-6', source: 'eBay', rating: 4.5, reviews: 7800 },
    { productName: 'Fitbit Versa 4 Fitness Smartwatch with Daily Readiness, GPS', price: 149.95, originalPrice: 229.95, imageUrl: 'https://m.media-amazon.com/images/I/61yHs1EALYL._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Fitbit-Versa-4/567890123', source: 'Walmart', rating: 4.3, reviews: 5300 },
    { productName: 'Garmin Forerunner 255 Running GPS Smartwatch, Black', price: 299.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/61iJb1YVJQL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/garmin-forerunner-255', source: 'Amazon', rating: 4.7, reviews: 9100 },
    { productName: 'Amazfit GTS 4 Mini Smart Watch for Men Women, Fitness Tracker', price: 69.99, originalPrice: 99.99, imageUrl: 'https://m.media-amazon.com/images/I/61WlL2aJU7L._AC_UY218_.jpg', productUrl: 'https://www.walmart.com/ip/Amazfit-GTS-4-Mini/678901234', source: 'Walmart', rating: 4.2, reviews: 2100 },
  ],
  default: [
    { productName: 'Generic Product Deal #1 - Best Value Pick', price: 29.99, originalPrice: 49.99, imageUrl: 'https://via.placeholder.com/200x200?text=Product+1', productUrl: 'https://www.amazon.com/', source: 'Amazon', rating: 4.2, reviews: 1500 },
    { productName: 'Generic Product Deal #2 - Premium Choice', price: 59.99, originalPrice: 89.99, imageUrl: 'https://via.placeholder.com/200x200?text=Product+2', productUrl: 'https://www.ebay.com/', source: 'eBay', rating: 4.5, reviews: 800 },
    { productName: 'Generic Product Deal #3 - Budget Friendly', price: 19.99, originalPrice: 34.99, imageUrl: 'https://via.placeholder.com/200x200?text=Product+3', productUrl: 'https://www.walmart.com/', source: 'Walmart', rating: 4.0, reviews: 560 },
    { productName: 'Generic Product Deal #4 - Top Rated', price: 79.99, originalPrice: 119.99, imageUrl: 'https://via.placeholder.com/200x200?text=Product+4', productUrl: 'https://www.amazon.com/', source: 'Amazon', rating: 4.7, reviews: 3200 },
    { productName: 'Generic Product Deal #5 - Editors Pick', price: 44.99, originalPrice: 69.99, imageUrl: 'https://via.placeholder.com/200x200?text=Product+5', productUrl: 'https://www.walmart.com/', source: 'Walmart', rating: 4.3, reviews: 2100 },
  ],
};

/**
 * Get mock products for a search query
 * @param {string} query
 * @returns {Array}
 */
function getMockProducts(query) {
  const q = query.toLowerCase();
  const keys = Object.keys(mockProducts).filter(k => k !== 'default');
  const matched = keys.find(k => q.includes(k));
  const products = matched ? mockProducts[matched] : mockProducts.default;

  // Add slight price variance to feel more real
  return products.map(p => ({
    ...p,
    price: parseFloat((p.price * (0.95 + Math.random() * 0.1)).toFixed(2)),
  }));
}

module.exports = { getMockProducts };
