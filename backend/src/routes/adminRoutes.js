const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateStock,
  getInventoryLogs,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  triggerLowStockAlertCheck,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(protect);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateStock);
router.get('/inventory/logs', getInventoryLogs);
router.post('/inventory/test-alert', triggerLowStockAlertCheck);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
