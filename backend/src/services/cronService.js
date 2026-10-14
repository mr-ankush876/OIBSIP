const cron = require('node-cron');
const Ingredient = require('../models/Ingredient');
const { sendLowStockAlert } = require('../config/email');

let cronTask = null;

/**
 * Scan for low stock ingredients and send alert if not recently alerted
 * @param {string} overrideAdminEmail
 * @param {boolean} forceCheck - If true, bypass 24h deduplication for manual test triggers
 * @returns {Promise<{ checkedCount: number, alertedCount: number, items: Array }>}
 */
const checkLowStockNow = async (overrideAdminEmail = null, forceCheck = false) => {
  try {
    const ingredients = await Ingredient.find({ isAvailable: true });
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const lowStockItemsToAlert = [];

    for (const item of ingredients) {
      if (item.stockQuantity <= item.lowStockThreshold) {
        // Check if an alert was already sent within the last 24 hours
        const recentlyAlerted = item.lastAlertSentAt && item.lastAlertSentAt > twentyFourHoursAgo;

        if (!recentlyAlerted || forceCheck) {
          lowStockItemsToAlert.push(item);
        }
      } else {
        // Stock is above threshold: re-arm alert if it had been alerted
        if (item.lastAlertSentAt) {
          item.lastAlertSentAt = null;
          await item.save();
        }
      }
    }

    if (lowStockItemsToAlert.length > 0) {
      console.log(`[Cron Monitor] Found ${lowStockItemsToAlert.length} low-stock ingredients. Dispatching alert email...`);
      await sendLowStockAlert(lowStockItemsToAlert, overrideAdminEmail);

      // Update lastAlertSentAt timestamp to prevent spamming
      const ids = lowStockItemsToAlert.map((i) => i._id);
      await Ingredient.updateMany({ _id: { $in: ids } }, { $set: { lastAlertSentAt: now } });
    } else {
      console.log('[Cron Monitor] Inventory scan completed. All ingredients above threshold or already notified.');
    }

    return {
      checkedCount: ingredients.length,
      alertedCount: lowStockItemsToAlert.length,
      items: lowStockItemsToAlert,
    };
  } catch (error) {
    console.error(`[Cron Monitor Error] Inventory check failed: ${error.message}`);
    return { error: error.message, checkedCount: 0, alertedCount: 0, items: [] };
  }
};

const initInventoryCron = () => {
  const schedule = process.env.LOW_STOCK_CRON_SCHEDULE || '0 * * * *'; // Run every hour

  if (!cron.validate(schedule)) {
    console.error(`[Cron Monitor] Invalid cron schedule: ${schedule}. Falling back to default '0 * * * *'.`);
  }

  const validSchedule = cron.validate(schedule) ? schedule : '0 * * * *';

  cronTask = cron.schedule(validSchedule, async () => {
    console.log(`[Cron Monitor] Running scheduled inventory check (${new Date().toISOString()})...`);
    await checkLowStockNow();
  });

  console.log(`[Cron Monitor] Low-stock inventory alert cron scheduled with pattern: "${validSchedule}"`);
  return cronTask;
};

const stopInventoryCron = () => {
  if (cronTask) {
    cronTask.stop();
    console.log('[Cron Monitor] Inventory cron stopped.');
  }
};

module.exports = {
  initInventoryCron,
  stopInventoryCron,
  checkLowStockNow,
};
