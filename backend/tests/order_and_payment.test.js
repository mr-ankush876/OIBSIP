const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Ingredient = require('../src/models/Ingredient');
const Order = require('../src/models/Order');
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

describe('Orders, Payment Verification & Inventory Deductions', () => {
  let customerToken;
  let customerUser;
  let testBase;
  let testSauce;
  let testCheese;
  let testVeg;

  beforeEach(async () => {
    customerUser = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'CUSTOMER',
      isVerified: true,
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: 'CUSTOMER' },
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_1234567890'
    );

    testBase = await Ingredient.create({ name: 'Thin Crust', category: 'base', price: 80, stockQuantity: 20 });
    testSauce = await Ingredient.create({ name: 'Marinara', category: 'sauce', price: 30, stockQuantity: 20 });
    testCheese = await Ingredient.create({ name: 'Mozzarella', category: 'cheese', price: 60, stockQuantity: 20 });
    testVeg = await Ingredient.create({ name: 'Olives', category: 'vegetable', price: 25, stockQuantity: 20 });
  });

  test('POST /api/orders - Creates order with server-validated prices, tax and delivery', async () => {
    const payload = {
      items: [
        {
          isCustom: true,
          quantity: 2,
          customDetails: {
            baseId: testBase._id,
            sauceId: testSauce._id,
            cheeseId: testCheese._id,
            vegetableIds: [testVeg._id],
          },
        },
      ],
      shippingAddress: {
        fullName: 'Test Customer',
        street: '123 Baker St',
        city: 'London',
        state: 'Greater London',
        zipCode: 'NW1 6XE',
        phone: '9876543210',
      },
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    // Unit price: 80 + 30 + 60 + 25 = 195. Qty 2 -> subtotal = 390.
    expect(res.body.order.subtotal).toBe(390);
    // Tax: 5% of 390 = 20.
    expect(res.body.order.tax).toBe(20);
    // Delivery: subtotal < 500 -> 40.
    expect(res.body.order.deliveryFee).toBe(40);
    // Total: 390 + 20 + 40 = 450.
    expect(res.body.order.totalAmount).toBe(450);
    expect(res.body.order.paymentStatus).toBe('PENDING');
  });

  test('POST /api/payments/verify - Idempotently verifies payment and atomically deducts stock', async () => {
    // 1. Create order
    const order = await Order.create({
      customer: customerUser._id,
      items: [
        {
          isCustom: true,
          name: 'Custom Pizza',
          quantity: 2,
          unitPrice: 195,
          subtotal: 390,
          customDetails: {
            base: testBase._id,
            sauce: testSauce._id,
            cheese: testCheese._id,
            vegetables: [testVeg._id],
          },
        },
      ],
      subtotal: 390,
      tax: 20,
      deliveryFee: 40,
      totalAmount: 450,
      shippingAddress: { fullName: 'A', street: 'B', city: 'C', state: 'D', zipCode: 'E', phone: 'F' },
      paymentStatus: 'PENDING',
      orderStatus: 'Order Received',
      stockDeducted: false,
    });

    // 2. Call verify payment
    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: order._id,
        razorpayOrderId: 'order_mock_123',
        razorpayPaymentId: 'pay_mock_123',
        razorpaySignature: 'test_signature',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify stock deduction: original was 20, deducted 2 for base/sauce/cheese/veg -> new stock should be 18
    const updatedBase = await Ingredient.findById(testBase._id);
    expect(updatedBase.stockQuantity).toBe(18);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).toBe('COMPLETED');
    expect(updatedOrder.stockDeducted).toBe(true);

    // 3. Duplicate verify attempt should be rejected
    const dupRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: order._id,
        razorpayOrderId: 'order_mock_123',
        razorpayPaymentId: 'pay_mock_123',
        razorpaySignature: 'test_signature',
      });

    expect(dupRes.statusCode).toBe(400);
    // Stock should still be 18 (no duplicate deduction)
    const baseAfterDup = await Ingredient.findById(testBase._id);
    expect(baseAfterDup.stockQuantity).toBe(18);
  });
});
