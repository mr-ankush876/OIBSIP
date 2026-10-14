const Ingredient = require('../models/Ingredient');
const Pizza = require('../models/Pizza');
const InventoryLog = require('../models/InventoryLog');

/**
 * Extract required ingredient deductions for an order's items
 * @param {Array} items - Order items
 * @returns {Promise<Map<string, { id: string, name: string, quantity: number }>>}
 */
const calculateRequiredIngredients = async (items) => {
  const deductions = new Map();

  for (const item of items) {
    const qty = item.quantity || 1;

    if (item.isCustom && item.customDetails) {
      // 1 Base, 1 Sauce, 1 Cheese
      const singleIngredients = [
        item.customDetails.base,
        item.customDetails.sauce,
        item.customDetails.cheese,
      ].filter(Boolean);

      for (const ingId of singleIngredients) {
        const idStr = ingId.toString();
        const current = deductions.get(idStr) || { id: idStr, quantity: 0 };
        current.quantity += 1 * qty;
        deductions.set(idStr, current);
      }

      // Multiple vegetables (1 portion each)
      if (Array.isArray(item.customDetails.vegetables)) {
        for (const vegId of item.customDetails.vegetables) {
          const idStr = vegId.toString();
          const current = deductions.get(idStr) || { id: idStr, quantity: 0 };
          current.quantity += 1 * qty;
          deductions.set(idStr, current);
        }
      }
    } else if (item.pizza) {
      // Standard menu pizza with recipe
      const pizzaDoc = await Pizza.findById(item.pizza).populate('recipe.ingredient');
      if (pizzaDoc && Array.isArray(pizzaDoc.recipe)) {
        for (const recipeItem of pizzaDoc.recipe) {
          if (recipeItem.ingredient) {
            const idStr = (recipeItem.ingredient._id || recipeItem.ingredient).toString();
            const current = deductions.get(idStr) || { id: idStr, quantity: 0 };
            current.quantity += (recipeItem.quantity || 1) * qty;
            deductions.set(idStr, current);
          }
        }
      }
    }
  }

  return deductions;
};

/**
 * Validate that sufficient stock exists for all items
 * @param {Array} items
 * @returns {Promise<{ available: boolean, outOfStockItems: Array<string> }>}
 */
const validateStockAvailability = async (items) => {
  const deductions = await calculateRequiredIngredients(items);
  const outOfStockItems = [];

  for (const [idStr, { quantity }] of deductions.entries()) {
    const ingredient = await Ingredient.findById(idStr);
    if (!ingredient) {
      outOfStockItems.push(`Unknown ingredient (ID: ${idStr})`);
    } else if (!ingredient.isAvailable || ingredient.stockQuantity < quantity) {
      outOfStockItems.push(
        `${ingredient.name} (Available: ${ingredient.stockQuantity}, Required: ${quantity})`
      );
    }
  }

  return {
    available: outOfStockItems.length === 0,
    outOfStockItems,
  };
};

/**
 * Atomically deduct stock for a verified order
 * @param {Object} order - Confirmed order document
 * @param {string} actorId - User ID who triggered the action
 * @returns {Promise<boolean>}
 */
const deductStockForOrder = async (order, actorId = null) => {
  if (order.stockDeducted) {
    console.log(`[Inventory] Stock already deducted for order ${order._id}. Skipping duplicate.`);
    return true;
  }

  const deductions = await calculateRequiredIngredients(order.items);

  for (const [idStr, { quantity }] of deductions.entries()) {
    // Atomic update with condition to prevent negative stock
    const original = await Ingredient.findById(idStr);
    if (!original) continue;

    const updated = await Ingredient.findOneAndUpdate(
      { _id: idStr, stockQuantity: { $gte: quantity } },
      { $inc: { stockQuantity: -quantity } },
      { new: true }
    );

    if (updated) {
      await InventoryLog.create({
        ingredient: updated._id,
        change: -quantity,
        previousQuantity: original.stockQuantity,
        newQuantity: updated.stockQuantity,
        reason: 'ORDER_DEDUCTION',
        relatedOrder: order._id,
        actor: actorId || order.customer,
        notes: `Deducted for Order #${order._id.toString().slice(-6).toUpperCase()}`,
      });
    }
  }

  order.stockDeducted = true;
  await order.save();
  return true;
};

/**
 * Restore stock if an order is cancelled
 * @param {Object} order
 * @param {string} actorId
 */
const restoreStockForOrder = async (order, actorId = null) => {
  if (!order.stockDeducted) {
    return;
  }

  const deductions = await calculateRequiredIngredients(order.items);

  for (const [idStr, { quantity }] of deductions.entries()) {
    const original = await Ingredient.findById(idStr);
    if (!original) continue;

    const updated = await Ingredient.findByIdAndUpdate(
      idStr,
      { $inc: { stockQuantity: quantity } },
      { new: true }
    );

    if (updated) {
      await InventoryLog.create({
        ingredient: updated._id,
        change: quantity,
        previousQuantity: original.stockQuantity,
        newQuantity: updated.stockQuantity,
        reason: 'ORDER_CANCELLATION',
        relatedOrder: order._id,
        actor: actorId,
        notes: `Restored stock from cancelled Order #${order._id.toString().slice(-6).toUpperCase()}`,
      });
    }
  }

  order.stockDeducted = false;
  await order.save();
};

/**
 * Manually adjust ingredient stock (by admin)
 */
const adjustIngredientStock = async (ingredientId, newQuantity, reason, actorId, notes = '') => {
  const ingredient = await Ingredient.findById(ingredientId);
  if (!ingredient) {
    throw new Error('Ingredient not found');
  }

  const previousQuantity = ingredient.stockQuantity;
  const change = newQuantity - previousQuantity;

  ingredient.stockQuantity = newQuantity;
  // If restocked above threshold, re-arm alerts
  if (newQuantity > ingredient.lowStockThreshold) {
    ingredient.lastAlertSentAt = null;
  }
  await ingredient.save();

  await InventoryLog.create({
    ingredient: ingredient._id,
    change,
    previousQuantity,
    newQuantity,
    reason: reason || 'MANUAL_ADJUSTMENT',
    actor: actorId,
    notes,
  });

  return ingredient;
};

module.exports = {
  calculateRequiredIngredients,
  validateStockAvailability,
  deductStockForOrder,
  restoreStockForOrder,
  adjustIngredientStock,
};
