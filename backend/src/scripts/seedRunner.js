const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const Pizza = require('../models/Pizza');

const initialIngredients = [
  // --- BASES (Exactly 5 Options) ---
  { name: 'Thin Crust', category: 'base', price: 80, stockQuantity: 50, lowStockThreshold: 20, unit: 'crust', description: 'Light, super crispy artisan flatbread style crust' },
  { name: 'Cheese Burst', category: 'base', price: 140, stockQuantity: 45, lowStockThreshold: 15, unit: 'crust', description: 'Crust filled with molten melted mozzarella cheese' },
  { name: 'Hand Tossed', category: 'base', price: 90, stockQuantity: 60, lowStockThreshold: 20, unit: 'crust', description: 'Traditional fluffy Italian hand stretched crust' },
  { name: 'Pan Crust', category: 'base', price: 100, stockQuantity: 50, lowStockThreshold: 20, unit: 'crust', description: 'Thick, golden crispy buttery crust baked in a deep pan' },
  { name: 'Gluten Free', category: 'base', price: 120, stockQuantity: 30, lowStockThreshold: 10, unit: 'crust', description: 'Healthy certified gluten-free alternative crust' },

  // --- SAUCES (Exactly 5 Options) ---
  { name: 'Classic Marinara', category: 'sauce', price: 30, stockQuantity: 100, lowStockThreshold: 25, unit: 'ladle', description: 'Slow-simmered San Marzano tomatoes with aromatic herbs' },
  { name: 'Spicy Peri-Peri', category: 'sauce', price: 35, stockQuantity: 90, lowStockThreshold: 20, unit: 'ladle', description: 'Fiery bird\'s eye chili and garlic kick' },
  { name: 'Creamy Garlic Alfredo', category: 'sauce', price: 45, stockQuantity: 80, lowStockThreshold: 20, unit: 'ladle', description: 'Rich white garlic butter parmesan cream' },
  { name: 'Tangy BBQ', category: 'sauce', price: 40, stockQuantity: 85, lowStockThreshold: 20, unit: 'ladle', description: 'Smoky sweet hickory barbecue glaze' },
  { name: 'Pesto Basil', category: 'sauce', price: 50, stockQuantity: 60, lowStockThreshold: 15, unit: 'ladle', description: 'Fresh Italian basil crushed with pine nuts and extra virgin olive oil' },

  // --- CHEESES ---
  { name: 'Mozzarella', category: 'cheese', price: 60, stockQuantity: 120, lowStockThreshold: 30, unit: 'portion', description: '100% genuine whole milk shredded mozzarella with golden stretch' },
  { name: 'Cheddar', category: 'cheese', price: 65, stockQuantity: 80, lowStockThreshold: 20, unit: 'portion', description: 'Aged sharp orange cheddar for a rich tang' },
  { name: 'Parmesan', category: 'cheese', price: 75, stockQuantity: 70, lowStockThreshold: 15, unit: 'portion', description: 'Grated authentic Parmigiano Reggiano' },
  { name: 'Four Cheese Blend', category: 'cheese', price: 95, stockQuantity: 50, lowStockThreshold: 15, unit: 'portion', description: 'Gourmet blend of Mozzarella, Cheddar, Gouda, and Provolone' },
  { name: 'Vegan Cheese', category: 'cheese', price: 80, stockQuantity: 40, lowStockThreshold: 10, unit: 'portion', description: 'Plant-based dairy-free coconut oil melting cheese' },

  // --- VEGETABLES ---
  { name: 'Black Olives', category: 'vegetable', price: 25, stockQuantity: 90, lowStockThreshold: 20, unit: 'portion', description: 'Sliced Mediterranean black olives' },
  { name: 'Bell Peppers', category: 'vegetable', price: 20, stockQuantity: 100, lowStockThreshold: 20, unit: 'portion', description: 'Crunchy red, yellow, and green capsicum slices' },
  { name: 'Mushrooms', category: 'vegetable', price: 30, stockQuantity: 80, lowStockThreshold: 20, unit: 'portion', description: 'Fresh sliced button mushrooms' },
  { name: 'Red Onions', category: 'vegetable', price: 15, stockQuantity: 110, lowStockThreshold: 25, unit: 'portion', description: 'Caramelized sweet and sharp red onion slivers' },
  { name: 'Jalapenos', category: 'vegetable', price: 25, stockQuantity: 85, lowStockThreshold: 20, unit: 'portion', description: 'Pickled spicy Mexican green jalapeno rings' },
  { name: 'Sweet Corn', category: 'vegetable', price: 20, stockQuantity: 95, lowStockThreshold: 20, unit: 'portion', description: 'Crisp golden sweet corn kernels' },
  { name: 'Fresh Tomatoes', category: 'vegetable', price: 15, stockQuantity: 100, lowStockThreshold: 20, unit: 'portion', description: 'Ripe vine-ripened diced tomatoes' },
  { name: 'Baby Spinach', category: 'vegetable', price: 25, stockQuantity: 70, lowStockThreshold: 15, unit: 'portion', description: 'Tender fresh farm-picked baby spinach leaves' },
];

const seedData = async () => {
  console.log('[Seed] Ensuring catalogue, pizzas, and administrator are seeded...');

  // 1. Seed or update ingredients
  const ingredientMap = new Map();
  for (const item of initialIngredients) {
    let ing = await Ingredient.findOne({ name: item.name });
    if (!ing) {
      ing = await Ingredient.create(item);
    } else {
      ing.price = item.price;
      ing.category = item.category;
      await ing.save();
    }
    ingredientMap.set(item.name, ing._id);
  }

  // 2. Seed Administrator
  const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'kankush1907@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Ankush143@';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.INITIAL_ADMIN_NAME || 'Ankush (Admin)',
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      phone: '+919876543210',
      countryCode: '+91',
    });
    console.log(`[Seed] Created Administrator: ${adminEmail}`);
  } else {
    admin.password = adminPassword;
    admin.role = 'ADMIN';
    admin.isVerified = true;
    admin.phone = '+919876543210';
    admin.countryCode = '+91';
    await admin.save();
    console.log(`[Seed] Synchronized Administrator credentials for: ${adminEmail} (Phone: +919876543210)`);
  }

  // 3. Seed Verified Customer
  const customerEmail = 'customer@slicecraftpizza.com';
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = await User.create({
      name: 'Alex Johnson',
      email: customerEmail,
      password: 'CustomerPass@123',
      role: 'CUSTOMER',
      isVerified: true,
      phone: '+919876500000',
      countryCode: '+91',
    });
    console.log(`[Seed] Created Verified Customer: ${customerEmail}`);
  } else {
    customer.password = 'CustomerPass@123';
    customer.isVerified = true;
    customer.phone = '+919876500000';
    customer.countryCode = '+91';
    await customer.save();
  }

  // 4. Seed Standard Pizzas
  const menuPizzas = [
    {
      name: 'Margherita Classica',
      description: 'Authentic Italian classic with pure Mozzarella, fragrant basil, and vine tomatoes over slow-cooked Marinara.',
      category: 'Veg',
      price: 299,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Vegetarian', 'Classic'],
      recipe: [
        { ingredient: ingredientMap.get('Hand Tossed'), quantity: 1 },
        { ingredient: ingredientMap.get('Classic Marinara'), quantity: 1 },
        { ingredient: ingredientMap.get('Mozzarella'), quantity: 1 },
        { ingredient: ingredientMap.get('Fresh Tomatoes'), quantity: 1 },
      ],
    },
    {
      name: 'Farmhouse Rustic Delight',
      description: 'Loaded harvest of crisp bell peppers, tender button mushrooms, sweet red onions, and ripe tomatoes.',
      category: 'Veg',
      price: 399,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Vegetarian', 'Bestseller'],
      recipe: [
        { ingredient: ingredientMap.get('Pan Crust'), quantity: 1 },
        { ingredient: ingredientMap.get('Classic Marinara'), quantity: 1 },
        { ingredient: ingredientMap.get('Mozzarella'), quantity: 1 },
        { ingredient: ingredientMap.get('Bell Peppers'), quantity: 1 },
        { ingredient: ingredientMap.get('Mushrooms'), quantity: 1 },
        { ingredient: ingredientMap.get('Red Onions'), quantity: 1 },
      ],
    },
    {
      name: 'Fiery Peri-Peri Feast',
      description: 'Spicy peri-peri infused sauce topped with tangy jalapenos, sweet corn, and red onions with molten cheese.',
      category: 'Special',
      price: 449,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Spicy', 'Chef Special'],
      recipe: [
        { ingredient: ingredientMap.get('Cheese Burst'), quantity: 1 },
        { ingredient: ingredientMap.get('Spicy Peri-Peri'), quantity: 1 },
        { ingredient: ingredientMap.get('Mozzarella'), quantity: 1 },
        { ingredient: ingredientMap.get('Jalapenos'), quantity: 1 },
        { ingredient: ingredientMap.get('Sweet Corn'), quantity: 1 },
      ],
    },
    {
      name: 'Four Cheese Garlic Royale',
      description: 'Creamy garlic Alfredo base smothered under a rich blend of Mozzarella, aged Cheddar, Parmesan, and tender herbs.',
      category: 'Special',
      price: 489,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Cheesy', 'Gourmet'],
      recipe: [
        { ingredient: ingredientMap.get('Thin Crust'), quantity: 1 },
        { ingredient: ingredientMap.get('Creamy Garlic Alfredo'), quantity: 1 },
        { ingredient: ingredientMap.get('Four Cheese Blend'), quantity: 1 },
        { ingredient: ingredientMap.get('Black Olives'), quantity: 1 },
      ],
    },
    {
      name: 'Smoky BBQ Sensation',
      description: 'Sweet and tangy hickory BBQ sauce topped with red onions, bell peppers, fresh mushrooms, and melted cheddar.',
      category: 'Special',
      price: 429,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Smoky', 'Popular'],
      recipe: [
        { ingredient: ingredientMap.get('Hand Tossed'), quantity: 1 },
        { ingredient: ingredientMap.get('Tangy BBQ'), quantity: 1 },
        { ingredient: ingredientMap.get('Cheddar'), quantity: 1 },
        { ingredient: ingredientMap.get('Red Onions'), quantity: 1 },
        { ingredient: ingredientMap.get('Mushrooms'), quantity: 1 },
      ],
    },
    {
      name: 'Pesto Basilico Verde',
      description: 'Artisan aromatic basil pesto with baby spinach, sweet corn, black olives, and shaved Italian parmesan.',
      category: 'Veg',
      price: 459,
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80',
      dietaryTags: ['Herbal', 'Vegetarian'],
      recipe: [
        { ingredient: ingredientMap.get('Gluten Free'), quantity: 1 },
        { ingredient: ingredientMap.get('Pesto Basil'), quantity: 1 },
        { ingredient: ingredientMap.get('Parmesan'), quantity: 1 },
        { ingredient: ingredientMap.get('Baby Spinach'), quantity: 1 },
        { ingredient: ingredientMap.get('Black Olives'), quantity: 1 },
      ],
    },
  ];

  for (const p of menuPizzas) {
    let pizza = await Pizza.findOne({ name: p.name });
    if (!pizza) {
      await Pizza.create(p);
    } else {
      pizza.price = p.price;
      pizza.description = p.description;
      pizza.recipe = p.recipe;
      await pizza.save();
    }
  }

  console.log('[Seed] Database initialization and seed check complete! ✨');
};

module.exports = seedData;
