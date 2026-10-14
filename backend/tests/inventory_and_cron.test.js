const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Ingredient = require('../src/models/Ingredient');
const Order = require('../src/models/Order');
const InventoryLog = require('../src/models/InventoryLog');
const { checkLowStockNow } = require('../src/services/cronService');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Admin Inventory Management, Cron Deduplication & Status Transitions', () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin Boss',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'ADMIN',
      isVerified: true,
    });

    adminToken = jwt.sign(
      { id: adminUser._id, role: 'ADMIN' },
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_1234567890'
    );
  });

  test('PUT /api/admin/inventory/:id - Admin updates stock and logs movement history', async () => {
    const item = await Ingredient.create({
      name: 'Mozzarella',
      category: 'cheese',
      price: 60,
      stockQuantity: 10,
      lowStockThreshold: 20,
    });

    const res = await request(app)
      .put(`/api/admin/inventory/${item._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        stockQuantity: 50,
        reason: 'RESTOCK',
        notes: 'Dairy supplier arrival',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ingredient.stockQuantity).toBe(50);

    // Verify InventoryLog was created
    const log = await InventoryLog.findOne({ ingredient: item._id });
    expect(log).toBeTruthy();
    expect(log.change).toBe(40);
    expect(log.previousQuantity).toBe(10);
    expect(log.newQuantity).toBe(50);
    expect(log.reason).toBe('RESTOCK');
  });

  test('Low-stock cron monitor deduplicates alerts within 24 hours', async () => {
    const item = await Ingredient.create({
      name: 'Mushrooms',
      category: 'vegetable',
      price: 30,
      stockQuantity: 5, // <= threshold
      lowStockThreshold: 20,
      isAvailable: true,
    });

    // 1st scan: should detect low stock and alert
    const firstRun = await checkLowStockNow();
    expect(firstRun.alertedCount).toBe(1);

    // Verify lastAlertSentAt was updated on item
    const alertedItem = await Ingredient.findById(item._id);
    expect(alertedItem.lastAlertSentAt).toBeTruthy();

    // 2nd scan immediately after: should skip duplicate alert!
    const secondRun = await checkLowStockNow();
    expect(secondRun.alertedCount).toBe(0);

    // Restock item above threshold: alert should re-arm
    alertedItem.stockQuantity = 40;
    await alertedItem.save();
    await checkLowStockNow();

    const rearmedItem = await Ingredient.findById(item._id);
    expect(rearmedItem.lastAlertSentAt).toBeNull();
  });

  test('PUT /api/admin/orders/:id/status - Validates order status transitions strictly', async () => {
    const order = await Order.create({
      customer: adminUser._id,
      items: [{ name: 'Test Pizza', quantity: 1, unitPrice: 200, subtotal: 200 }],
      subtotal: 200,
      tax: 10,
      deliveryFee: 40,
      totalAmount: 250,
      shippingAddress: { fullName: 'A', street: 'B', city: 'C', state: 'D', zipCode: 'E', phone: 'F' },
      paymentStatus: 'COMPLETED',
      orderStatus: 'Order Received',
    });

    // Valid transition: Order Received -> In Kitchen
    const validRes = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStatus: 'In Kitchen' });

    expect(validRes.statusCode).toBe(200);
    expect(validRes.body.order.orderStatus).toBe('In Kitchen');

    // Invalid transition: In Kitchen -> Delivered (skipping Sent to Delivery)
    const invalidRes = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newStatus: 'Delivered' });

    expect(invalidRes.statusCode).toBe(400);
    expect(invalidRes.body.success).toBe(false);
  });
});
