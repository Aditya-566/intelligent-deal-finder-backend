/**
 * Mock/fallback data for when scrapers are blocked.
 * Sources: Amazon, Flipkart, Myntra
 */

const mockProducts = {
  laptop: [
    { productName: 'Lenovo IdeaPad Slim 3 Intel Core i5 12th Gen, 8GB RAM, 512GB SSD', price: 649.99, originalPrice: 799.99, imageUrl: 'https://m.media-amazon.com/images/I/71XP9f6OPHL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0922GRG2X', source: 'Amazon', rating: 4.4, reviews: 3241 },
    { productName: 'HP Pavilion 15 Intel Core i5, 16GB RAM, 512GB SSD, Windows 11', price: 559.99, originalPrice: 699.99, imageUrl: 'https://m.media-amazon.com/images/I/61fk5OOyKuL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/hp-pavilion-15', source: 'Flipkart', rating: 4.2, reviews: 1856 },
    { productName: 'ASUS VivoBook 15 AMD Ryzen 5, 8GB RAM, 512GB SSD, 15.6" FHD', price: 579.99, originalPrice: 749.99, imageUrl: 'https://m.media-amazon.com/images/I/71M+o7B2NwL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0922GRG2Y', source: 'Amazon', rating: 4.3, reviews: 2103 },
    { productName: 'Dell Inspiron 15 Intel Core i7, 16GB RAM, 512GB SSD, NVIDIA GPU', price: 799.00, originalPrice: 999.00, imageUrl: 'https://m.media-amazon.com/images/I/71s0tE1FCJL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/dell-inspiron-15', source: 'Flipkart', rating: 4.1, reviews: 978 },
    { productName: 'Acer Aspire Lite AMD Ryzen 5, 8GB RAM, 512GB SSD, Windows 11', price: 519.99, originalPrice: 649.99, imageUrl: 'https://m.media-amazon.com/images/I/71T9h6Mkc6L._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/acer-aspire-lite', source: 'Amazon', rating: 4.5, reviews: 5120 },
  ],
  headphones: [
    { productName: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', price: 279.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0863TXGM3', source: 'Amazon', rating: 4.8, reviews: 45210 },
    { productName: 'boAt Rockerz 450 Bluetooth On Ear Headphones with Mic', price: 19.99, originalPrice: 35.99, imageUrl: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/boat-rockerz-450', source: 'Flipkart', rating: 4.2, reviews: 89000 },
    { productName: 'Apple AirPods Pro (2nd Generation) Wireless Earbuds, MagSafe', price: 189.99, originalPrice: 249.00, imageUrl: 'https://m.media-amazon.com/images/I/71bhWgQK-cL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/airpods-pro-2', source: 'Amazon', rating: 4.9, reviews: 89000 },
    { productName: 'JBL Tune 760NC Wireless Over-Ear Noise Canceling Headphones', price: 79.95, originalPrice: 129.95, imageUrl: 'https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/jbl-tune-760nc', source: 'Flipkart', rating: 4.5, reviews: 22000 },
    { productName: 'Sony WF-1000XM4 True Wireless Noise Canceling Earbuds', price: 199.99, originalPrice: 279.99, imageUrl: 'https://m.media-amazon.com/images/I/51oXBb7JHBL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/sony-wf-1000xm4', source: 'Amazon', rating: 4.7, reviews: 12400 },
  ],
  phone: [
    { productName: 'Samsung Galaxy S23 FE 5G, 128GB, Unlocked Android Smartphone', price: 399.99, originalPrice: 499.99, imageUrl: 'https://m.media-amazon.com/images/I/71byblRHscL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/B0CGYY3KTM', source: 'Amazon', rating: 4.5, reviews: 8200 },
    { productName: 'OnePlus 12R 5G, 16GB RAM, 256GB Storage, Cool Blue', price: 361.99, originalPrice: 481.99, imageUrl: 'https://m.media-amazon.com/images/I/71a+fAqCjoL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/oneplus-12r', source: 'Flipkart', rating: 4.4, reviews: 4500 },
    { productName: 'Apple iPhone 14 128GB, Starlight - Unlocked', price: 699.00, originalPrice: 829.00, imageUrl: 'https://m.media-amazon.com/images/I/61cwywLZR-L._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/iphone-14', source: 'Amazon', rating: 4.7, reviews: 32100 },
    { productName: 'Realme Narzo 60 Pro 5G, 128GB, Cosmic Black', price: 205.99, originalPrice: 277.99, imageUrl: 'https://m.media-amazon.com/images/I/61bCT5kWLxL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/realme-narzo-60-pro', source: 'Flipkart', rating: 4.2, reviews: 3100 },
    { productName: 'Google Pixel 7a 5G Android Phone, 128GB, Unlocked', price: 349.00, originalPrice: 499.00, imageUrl: 'https://m.media-amazon.com/images/I/61HN5p3TaEL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/google-pixel-7a', source: 'Amazon', rating: 4.6, reviews: 11200 },
  ],
  watch: [
    { productName: 'Apple Watch Series 9 GPS 41mm, Starlight Aluminum', price: 329.00, originalPrice: 399.00, imageUrl: 'https://m.media-amazon.com/images/I/71XH+2xt4sL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/apple-watch-s9', source: 'Amazon', rating: 4.8, reviews: 22000 },
    { productName: 'Samsung Galaxy Watch 6 Classic 43mm, Graphite Smartwatch', price: 249.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/7175jmwbCHL._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/samsung-galaxy-watch-6', source: 'Flipkart', rating: 4.5, reviews: 7800 },
    { productName: 'Garmin Forerunner 255 Running GPS Smartwatch, Black', price: 299.99, originalPrice: 349.99, imageUrl: 'https://m.media-amazon.com/images/I/61iJb1YVJQL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/garmin-forerunner-255', source: 'Amazon', rating: 4.7, reviews: 9100 },
    { productName: 'Noise ColorFit Pro 5 Smart Watch, 1.46" AMOLED Display', price: 29.99, originalPrice: 59.99, imageUrl: 'https://m.media-amazon.com/images/I/61WlL2aJU7L._AC_UY218_.jpg', productUrl: 'https://www.flipkart.com/noise-colorfit-pro-5', source: 'Flipkart', rating: 4.2, reviews: 2100 },
    { productName: 'Fitbit Versa 4 Fitness Smartwatch with Daily Readiness GPS', price: 149.95, originalPrice: 229.95, imageUrl: 'https://m.media-amazon.com/images/I/61yHs1EALYL._AC_UY218_.jpg', productUrl: 'https://www.amazon.com/dp/fitbit-versa-4', source: 'Amazon', rating: 4.3, reviews: 5300 },
  ],
  clothing: [
    { productName: "Peter England Men's Regular Fit Formal Shirt - Blue", price: 14.99, originalPrice: 26.99, imageUrl: 'https://via.placeholder.com/200x200?text=Shirt', productUrl: 'https://www.myntra.com/peter-england-shirt', source: 'Myntra', rating: 4.1, reviews: 3200 },
    { productName: "Levi's Men's 511 Slim Fit Jeans - Dark Wash", price: 39.99, originalPrice: 59.99, imageUrl: 'https://via.placeholder.com/200x200?text=Jeans', productUrl: 'https://www.myntra.com/levis-jeans', source: 'Myntra', rating: 4.4, reviews: 8100 },
    { productName: "H&M Women's Oversized Fit T-Shirt - Black", price: 12.99, originalPrice: 21.99, imageUrl: 'https://via.placeholder.com/200x200?text=T-Shirt', productUrl: 'https://www.myntra.com/hm-tshirt', source: 'Myntra', rating: 4.0, reviews: 5600 },
    { productName: "Puma Men's RS-X Running Shoes", price: 59.99, originalPrice: 89.99, imageUrl: 'https://via.placeholder.com/200x200?text=Shoes', productUrl: 'https://www.myntra.com/puma-rsx', source: 'Myntra', rating: 4.5, reviews: 4200 },
    { productName: "Nike Men's Dri-FIT Training T-Shirt", price: 29.99, originalPrice: 44.99, imageUrl: 'https://via.placeholder.com/200x200?text=Nike', productUrl: 'https://www.myntra.com/nike-drifit', source: 'Myntra', rating: 4.3, reviews: 9800 },
  ],
  default: [
    { productName: 'Best Value Electronics Deal — Amazon Top Pick', price: 29.99, originalPrice: 49.99, imageUrl: 'https://via.placeholder.com/200x200?text=Deal+1', productUrl: 'https://www.amazon.com/', source: 'Amazon', rating: 4.2, reviews: 1500 },
    { productName: 'Premium Deal — Flipkart Featured Product', price: 19.99, originalPrice: 34.99, imageUrl: 'https://via.placeholder.com/200x200?text=Deal+2', productUrl: 'https://www.flipkart.com/', source: 'Flipkart', rating: 4.5, reviews: 800 },
    { productName: 'Top Fashion Pick — Myntra Trending Item', price: 14.99, originalPrice: 24.99, imageUrl: 'https://via.placeholder.com/200x200?text=Deal+3', productUrl: 'https://www.myntra.com/', source: 'Myntra', rating: 4.0, reviews: 560 },
    { productName: 'Editor\'s Choice — Amazon Best Seller', price: 79.99, originalPrice: 119.99, imageUrl: 'https://via.placeholder.com/200x200?text=Deal+4', productUrl: 'https://www.amazon.com/', source: 'Amazon', rating: 4.7, reviews: 3200 },
    { productName: 'Flash Sale Pick — Flipkart Daily Deal', price: 44.99, originalPrice: 69.99, imageUrl: 'https://via.placeholder.com/200x200?text=Deal+5', productUrl: 'https://www.flipkart.com/', source: 'Flipkart', rating: 4.3, reviews: 2100 },
  ],
};

function getMockProducts(query) {
  const q = query.toLowerCase();
  const keys = Object.keys(mockProducts).filter(k => k !== 'default');
  const matched = keys.find(k => q.includes(k));
  const products = matched ? mockProducts[matched] : mockProducts.default;

  return products.map(p => ({
    ...p,
    price: parseFloat((p.price * (0.95 + Math.random() * 0.1)).toFixed(2)),
  }));
}

module.exports = { getMockProducts };
