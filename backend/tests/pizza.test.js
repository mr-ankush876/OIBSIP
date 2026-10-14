const request = require('supertest');
const app = require('../src/app');
const Ingredient = require('../src/models/Ingredient');
const Pizza = require('../src/models/Pizza');
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

describe('Pizza Menu & Custom Builder API', () => {
  test('GET /api/pizzas/ingredients - Returns categorized ingredients (5 bases, 5 sauces)', async () => {
    // Seed exactly 5 bases & 5 sauces
    const bases = ['Thin Crust', 'Cheese Burst', 'Hand Tossed', 'Pan Crust', 'Gluten Free'];
    for (const b of bases) {
      await Ingredient.create({ name: b, category: 'base', price: 100, stockQuantity: 50 });
    }
    const sauces = ['Classic Marinara', 'Spicy Peri-Peri', 'Alfredo', 'BBQ', 'Pesto'];
    for (const s of sauces) {
      await Ingredient.create({ name: s, category: 'sauce', price: 40, stockQuantity: 50 });
    }
    await Ingredient.create({ name: 'Mozzarella', category: 'cheese', price: 60, stockQuantity: 50 });
    await Ingredient.create({ name: 'Olives', category: 'vegetable', price: 25, stockQuantity: 50 });

    const res = await request(app).get('/api/pizzas/ingredients');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.ingredients.bases.length).toBe(5);
    expect(res.body.ingredients.sauces.length).toBe(5);
    expect(res.body.ingredients.cheeses.length).toBe(1);
    expect(res.body.ingredients.vegetables.length).toBe(1);
  });

  test('POST /api/pizzas/custom-price - Authoritatively computes server price', async () => {
    const base = await Ingredient.create({ name: 'Cheese Burst', category: 'base', price: 140, stockQuantity: 50 });
    const sauce = await Ingredient.create({ name: 'Pesto Basil', category: 'sauce', price: 50, stockQuantity: 50 });
    const cheese = await Ingredient.create({ name: 'Parmesan', category: 'cheese', price: 75, stockQuantity: 50 });
    const veg1 = await Ingredient.create({ name: 'Jalapenos', category: 'vegetable', price: 25, stockQuantity: 50 });
    const veg2 = await Ingredient.create({ name: 'Mushrooms', category: 'vegetable', price: 30, stockQuantity: 50 });

    const res = await request(app)
      .post('/api/pizzas/custom-price')
      .send({
        baseId: base._id,
        sauceId: sauce._id,
        cheeseId: cheese._id,
        vegetableIds: [veg1._id, veg2._id],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    // 140 + 50 + 75 + 25 + 30 = 320
    expect(res.body.priceBreakdown.unitPrice).toBe(320);
    expect(res.body.isAvailable).toBe(true);
  });
});
