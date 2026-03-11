const NodeCache = require('node-cache');

// Cache TTL: 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports = cache;
