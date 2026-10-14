const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const Ingredient = require('../models/Ingredient');
const { validateStockAvailability, restoreStockForOrder } = require('../services/inventoryService');
const { notifyOrderStatus } = require('../services/socketService');

/**
 * @desc    Create a new order with authoritative backend price calculation
 * @route   POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address and phone number are required.',
      });
    }

    // Authoritative recalculation of all items
    const validatedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (item.isCustom) {
        // Custom pizza verification
        const { baseId, sauceId, cheeseId, vegetableIds = [] } = item.customDetails || {};
        if (!baseId || !sauceId || !cheeseId) {
          return res.status(400).json({
            success: false,
            message: 'Custom pizzas require base, sauce, and cheese selections.',
          });
        }

        const [base, sauce, cheese] = await Promise.all([
          Ingredient.findById(baseId),
          Ingredient.findById(sauceId),
          Ingredient.findById(cheeseId),
        ]);

        if (!base || !sauce || !cheese) {
          return res.status(400).json({
            success: false,
            message: 'One or more selected custom ingredients do not exist.',
          });
        }

        let vegetables = [];
        if (vegetableIds.length > 0) {
          vegetables = await Ingredient.find({ _id: { $in: vegetableIds }, category: 'vegetable' });
        }

        const unitPrice =
          base.price +
          sauce.price +
          cheese.price +
          vegetables.reduce((acc, v) => acc + v.price, 0);

        const subtotal = unitPrice * quantity;
        calculatedSubtotal += subtotal;

        validatedItems.push({
          isCustom: true,
          name: `Custom Handcrafted Pizza (${base.name})`,
          quantity,
          unitPrice,
          subtotal,
          customDetails: {
            base: base._id,
            sauce: sauce._id,
            cheese: cheese._id,
            vegetables: vegetables.map((v) => v._id),
            baseName: base.name,
            sauceName: sauce.name,
            cheeseName: cheese.name,
            vegetableNames: vegetables.map((v) => v.name),
          },
        });
      } else {
        // Standard menu pizza verification
        const pizza = await Pizza.findById(item.pizza);
        if (!pizza) {
          return res.status(400).json({
            success: false,
            message: `Selected pizza (ID: ${item.pizza}) not found.`,
          });
        }

        const unitPrice = pizza.price;
        const subtotal = unitPrice * quantity;
        calculatedSubtotal += subtotal;

        validatedItems.push({
          pizza: pizza._id,
          isCustom: false,
          name: pizza.name,
          quantity,
          unitPrice,
          subtotal,
        });
      }
    }

    // Check inventory stock availability
    const stockCheck = await validateStockAvailability(validatedItems);
    if (!stockCheck.available) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place order: Some ingredients are out of stock.',
        outOfStockItems: stockCheck.outOfStockItems,
      });
    }

    // Taxes and delivery fees
    const tax = Math.round(calculatedSubtotal * 0.05); // 5% GST
    const deliveryFee = calculatedSubtotal >= 500 ? 0 : 40; // Free delivery over ₹500
    const totalAmount = calculatedSubtotal + tax + deliveryFee;

    const order = new Order({
      customer: req.user._id,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      tax,
      deliveryFee,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        zipCode: shippingAddress.zipCode.trim(),
        phone: shippingAddress.phone.trim(),
      },
      paymentStatus: 'PENDING',
      orderStatus: 'Order Received',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: new Date(),
          updatedBy: req.user._id,
          note: 'Order placed by customer, pending payment verification',
        },
      ],
      stockDeducted: false,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in customer's orders
 * @route   GET /api/orders/my-orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.pizza', 'name image category')
      .populate('items.customDetails.base', 'name price')
      .populate('items.customDetails.sauce', 'name price')
      .populate('items.customDetails.cheese', 'name price')
      .populate('items.customDetails.vegetables', 'name price');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID (customer ownership or admin)
 * @route   GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.pizza', 'name image category')
      .populate('items.customDetails.base', 'name price')
      .populate('items.customDetails.sauce', 'name price')
      .populate('items.customDetails.cheese', 'name price')
      .populate('items.customDetails.vegetables', 'name price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check (Section 6 & 17)
    const isOwner = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order.',
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order (if not yet sent to kitchen/delivery)
 * @route   POST /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check
    const isOwner = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Unauthorized to cancel this order.',
      });
    }

    if (order.orderStatus === 'Sent to Delivery' || order.orderStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${order.orderStatus}'.`,
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled.',
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Order cancelled by user/admin',
    });

    // If stock had been deducted, restore it
    if (order.stockDeducted) {
      await restoreStockForOrder(order, req.user._id);
    }

    await order.save();

    // Notify customer in real-time
    notifyOrderStatus(order._id, 'Cancelled', new Date(), order.statusHistory);

    res.status(200).json({
      success: true,
      message: 'Order has been cancelled successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
