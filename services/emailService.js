const sgMail = require('@sendgrid/mail');
const logger = require('../config/logger');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@intelligentdealfinder.com';

/**
 * Send a price alert email via SendGrid.
 */
async function sendPriceAlertEmail({ to, productName, targetPrice, currentPrice, productUrl }) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('[Email] SENDGRID_API_KEY not set — skipping email');
    return;
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: `🎉 Price Drop Alert: ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #f1f5f9; padding: 32px; border-radius: 12px;">
        <h1 style="color: #6366f1; margin-bottom: 8px;">🔔 Price Alert Triggered!</h1>
        <p style="font-size: 1.1rem; color: #94a3b8; margin-bottom: 24px;">
          Great news! The price for <strong style="color: #f1f5f9;">${productName}</strong> has dropped below your target.
        </p>

        <div style="background: #1a1a2e; border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #94a3b8;">Your Target Price</span>
            <span style="color: #10b981; font-weight: bold; font-size: 1.2rem;">$${targetPrice.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8;">Current Price</span>
            <span style="color: #6366f1; font-weight: bold; font-size: 1.4rem;">$${currentPrice.toFixed(2)}</span>
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(99,102,241,0.2);">
            <span style="color: #94a3b8;">You save: </span>
            <span style="color: #10b981; font-weight: bold;">$${(targetPrice - currentPrice).toFixed(2)}</span>
          </div>
        </div>

        <a href="${productUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; 
                  text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 1rem;">
          View Deal →
        </a>

        <p style="margin-top: 24px; font-size: 0.85rem; color: #64748b;">
          You received this because you set a price alert on Intelligent Deal Finder. 
          <br>To manage your alerts, visit your dashboard.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    logger.info(`[Email] Price alert sent to ${to} for ${productName}`);
  } catch (err) {
    logger.error('[Email] SendGrid error:', err.response?.body || err.message);
    throw err;
  }
}

/**
 * Send a generic transactional email.
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    logger.warn('[Email] SENDGRID_API_KEY not set — skipping email');
    return;
  }
  try {
    await sgMail.send({ to, from: FROM_EMAIL, subject, html });
    logger.info(`[Email] Email sent to ${to}: "${subject}"`);
  } catch (err) {
    logger.error('[Email] SendGrid error:', err.response?.body || err.message);
    throw err;
  }
}

module.exports = { sendPriceAlertEmail, sendEmail };
