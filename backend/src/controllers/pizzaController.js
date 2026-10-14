const Pizza = require('../models/Pizza');
const Ingredient = require('../models/Ingredient');

/**
 * @desc    Get all menu pizzas with search and filters
 * @route   GET /api/pizzas
 */
const getMenuPizzas = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    const query = { isAvailable: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { dietaryTags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'name') sortOptions = { name: 1 };

    const pizzas = await Pizza.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pizza by ID
 * @route   GET /api/pizzas/:id
 */
const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id).populate('recipe.ingredient');
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    res.status(200).json({ success: true, pizza });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all ingredients for Custom Pizza Builder grouped by category
 * @route   GET /api/pizzas/ingredients
 */
const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ price: 1 });

    const grouped = {
      bases: ingredients.filter((i) => i.category === 'base'),
      sauces: ingredients.filter((i) => i.category === 'sauce'),
      cheeses: ingredients.filter((i) => i.category === 'cheese'),
      vegetables: ingredients.filter((i) => i.category === 'vegetable'),
    };

    res.status(200).json({
      success: true,
      ingredients: grouped,
      all: ingredients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authoritatively calculate custom pizza price and stock check
 * @route   POST /api/pizzas/custom-price
 */
const calculateCustomPrice = async (req, res, next) => {
  try {
    const { baseId, sauceId, cheeseId, vegetableIds = [] } = req.body;

    if (!baseId || !sauceId || !cheeseId) {
      return res.status(400).json({
        success: false,
        message: 'A custom pizza requires exactly one base, one sauce, and one cheese selection.',
      });
    }

    const [base, sauce, cheese] = await Promise.all([
      Ingredient.findById(baseId),
      Ingredient.findById(sauceId),
      Ingredient.findById(cheeseId),
    ]);

    if (!base || base.category !== 'base') {
      return res.status(400).json({ success: false, message: 'Invalid base option selected.' });
    }
    if (!sauce || sauce.category !== 'sauce') {
      return res.status(400).json({ success: false, message: 'Invalid sauce option selected.' });
    }
    if (!cheese || cheese.category !== 'cheese') {
      return res.status(400).json({ success: false, message: 'Invalid cheese option selected.' });
    }

    let vegetables = [];
    if (vegetableIds.length > 0) {
      vegetables = await Ingredient.find({
        _id: { $in: vegetableIds },
        category: 'vegetable',
      });
    }

    const basePrice = base.price;
    const saucePrice = sauce.price;
    const cheesePrice = cheese.price;
    const vegetablesTotal = vegetables.reduce((sum, v) => sum + v.price, 0);

    const unitPrice = basePrice + saucePrice + cheesePrice + vegetablesTotal;

    // Check availability
    const unavailable = [];
    if (!base.isAvailable || base.stockQuantity < 1) unavailable.push(base.name);
    if (!sauce.isAvailable || sauce.stockQuantity < 1) unavailable.push(sauce.name);
    if (!cheese.isAvailable || cheese.stockQuantity < 1) unavailable.push(cheese.name);
    for (const veg of vegetables) {
      if (!veg.isAvailable || veg.stockQuantity < 1) unavailable.push(veg.name);
    }

    res.status(200).json({
      success: true,
      priceBreakdown: {
        base: { id: base._id, name: base.name, price: basePrice },
        sauce: { id: sauce._id, name: sauce.name, price: saucePrice },
        cheese: { id: cheese._id, name: cheese.name, price: cheesePrice },
        vegetables: vegetables.map((v) => ({ id: v._id, name: v.name, price: v.price })),
        vegetablesTotal,
        unitPrice,
      },
      isAvailable: unavailable.length === 0,
      unavailableIngredients: unavailable,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuPizzas,
  getPizzaById,
  getIngredients,
  calculateCustomPrice,
};
