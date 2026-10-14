const Order = require('../models/Order');
const Ingredient = require('../models/Ingredient');
const InventoryLog = require('../models/InventoryLog');
const AuditLog = require('../models/AuditLog');
const { adjustIngredientStock, restoreStockForOrder } = require('../services/inventoryService');
const { notifyOrderStatus } = require('../services/socketService');
const { checkLowStockNow } = require('../services/cronService');

/**
 * Valid order status transitions map
 */
const VALID_TRANSITIONS = {
  'Order Received': ['In Kitchen', 'Cancelled'],
  'In Kitchen': ['Sent to Delivery', 'Cancelled'],
  'Sent to Delivery': ['Delivered', 'Cancelled'],
  'Delivered': [],
  'Cancelled': [],
};

/**
 * @desc    Get all inventory ingredients with status
 * @route   GET /api/admin/inventory
 */
const getInventory = async (req, res, next) => {
  try {
    const { category, lowStockOnly, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const ingredients = await Ingredient.find(query).sort({ category: 1, name: 1 });

    let filtered = ingredients;
    if (lowStockOnly === 'true') {
      filtered = ingredients.filter((i) => i.stockQuantity <= i.lowStockThreshold);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      ingredients: filtered,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually adjust ingredient stock
 * @route   PUT /api/admin/inventory/:id
 */
const updateStock = async (req, res, next) => {
  try {
    const { stockQuantity, lowStockThreshold, isAvailable, reason, notes } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    if (lowStockThreshold !== undefined) {
      ingredient.lowStockThreshold = Math.max(1, parseInt(lowStockThreshold, 10));
    }

    if (isAvailable !== undefined) {
      ingredient.isAvailable = Boolean(isAvailable);
    }

    let updatedIngredient = ingredient;

    if (stockQuantity !== undefined) {
      const newQty = Math.max(0, parseInt(stockQuantity, 10));
      updatedIngredient = await adjustIngredientStock(
        ingredient._id,
        newQty,
        reason || 'MANUAL_ADJUSTMENT',
        req.user._id,
        notes || 'Admin manual stock update'
      );
    } else {
      await ingredient.save();
    }

    // Log admin audit
    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_INVENTORY',
      targetResource: 'Ingredient',
      resourceId: ingredient._id.toString(),
      details: { stockQuantity, lowStockThreshold, isAvailable, reason, notes },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Ingredient inventory updated successfully.',
      ingredient: updatedIngredient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory movement log history
 * @route   GET /api/admin/inventory/logs
 */
const getInventoryLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const logs = await InventoryLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('ingredient', 'name category unit')
      .populate('actor', 'name email role')
      .populate('relatedOrder', '_id totalAmount orderStatus');

    const total = await InventoryLog.countDocuments();

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders with pagination and filtering
 * @route   GET /api/admin/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'name email phone')
      .populate('items.pizza', 'name image category')
      .populate('items.customDetails.base', 'name price')
      .populate('items.customDetails.sauce', 'name price')
      .populate('items.customDetails.cheese', 'name price')
      .populate('items.customDetails.vegetables', 'name price');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status with transition validation
 * @route   PUT /api/admin/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { newStatus, note } = req.body;

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'New status is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = order.orderStatus;

    if (currentStatus === newStatus) {
      return res.status(400).json({
        success: false,
        message: `Order is already in '${currentStatus}' status.`,
      });
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: Cannot change order status from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowed.join(', ') || 'None (terminal status)'}`,
      });
    }

    order.orderStatus = newStatus;
    const historyEntry = {
      status: newStatus,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: note || `Status updated to ${newStatus} by admin`,
    };
    order.statusHistory.push(historyEntry);

    // If cancelled and stock was deducted, restore stock
    if (newStatus === 'Cancelled' && order.stockDeducted) {
      await restoreStockForOrder(order, req.user._id);
    }

    await order.save();

    // Broadcast real-time status update to customer's socket room
    notifyOrderStatus(order._id, newStatus, historyEntry.timestamp, order.statusHistory);

    // Record audit log
    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_ORDER_STATUS',
      targetResource: 'Order',
      resourceId: order._id.toString(),
      details: { previousStatus: currentStatus, newStatus, note },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to '${newStatus}'`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard metrics
 * @route   GET /api/admin/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, completedOrders, pendingOrders, totalIngredients, lowStockIngredients] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ paymentStatus: 'COMPLETED' }),
        Order.countDocuments({ orderStatus: { $in: ['Order Received', 'In Kitchen', 'Sent to Delivery'] } }),
        Ingredient.countDocuments(),
        Ingredient.find({ $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } }),
      ]);

    // Calculate revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        totalIngredients,
        lowStockCount: lowStockIngredients.length,
        lowStockItems: lowStockIngredients,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test trigger for low-stock email alerts (Section 16 requirement)
 * @route   POST /api/admin/inventory/test-alert
 */
const triggerLowStockAlertCheck = async (req, res, next) => {
  try {
    const { targetEmail } = req.body;
    const result = await checkLowStockNow(targetEmail || req.user.email, true);

    res.status(200).json({
      success: true,
      message: 'Low stock inventory alert check triggered.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  updateStock,
  getInventoryLogs,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  triggerLowStockAlertCheck,
};
