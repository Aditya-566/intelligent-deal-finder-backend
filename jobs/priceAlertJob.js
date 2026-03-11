const cron = require('node-cron');
const PriceAlert = require('../models/PriceAlert');
const User = require('../models/User');
const { scrapeAll } = require('../scraper/scraper.service');
const { sendPriceAlertEmail } = require('../services/emailService');
const logger = require('../config/logger');

/**
 * Run every 30 minutes: check all active (non-triggered) alerts.
 * Scrapes current prices; if currentPrice <= targetPrice, sends email and marks triggered.
 */
function startPriceAlertJob() {
  // Run at :00 and :30 of every hour
  cron.schedule('0,30 * * * *', async () => {
    logger.info('[PriceAlertJob] Starting price check...');

    try {
      const alerts = await PriceAlert.find({ triggered: false });
      if (!alerts.length) {
        logger.info('[PriceAlertJob] No active alerts found.');
        return;
      }

      logger.info(`[PriceAlertJob] Checking ${alerts.length} alert(s)...`);

      for (const alert of alerts) {
        try {
          // Scrape to get fresh price for this product
          const results = await scrapeAll(alert.productName, {});
          if (!results.length) continue;

          // Find best matching product by URL or lowest price from same source
          const match = results.find(
            (p) => p.productUrl === alert.productUrl || p.source === alert.source
          ) || results[0];

          const newPrice = match?.price;
          if (!newPrice) continue;

          // Update stored current price
          alert.currentPrice = newPrice;

          if (newPrice <= alert.targetPrice) {
            // Fetch user email
            const user = await User.findById(alert.userId);
            if (user?.email) {
              await sendPriceAlertEmail({
                to: user.email,
                productName: alert.productName,
                targetPrice: alert.targetPrice,
                currentPrice: newPrice,
                productUrl: alert.productUrl,
              });
            }
            alert.triggered = true;
            logger.info(`[PriceAlertJob] Alert triggered for "${alert.productName}" — $${newPrice}`);
          }

          await alert.save();
        } catch (innerErr) {
          logger.error(`[PriceAlertJob] Error processing alert ${alert._id}:`, innerErr.message);
        }
      }

      logger.info('[PriceAlertJob] Price check complete.');
    } catch (err) {
      logger.error('[PriceAlertJob] Fatal error:', err.message);
    }
  });

  logger.info('[PriceAlertJob] Scheduled (every 30 minutes)');
}

module.exports = { startPriceAlertJob };
