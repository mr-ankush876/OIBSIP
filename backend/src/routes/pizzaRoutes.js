const express = require('express');
const router = express.Router();
const {
  getMenuPizzas,
  getPizzaById,
  getIngredients,
  calculateCustomPrice,
} = require('../controllers/pizzaController');

router.get('/', getMenuPizzas);
router.get('/ingredients', getIngredients);
router.post('/custom-price', calculateCustomPrice);
router.get('/:id', getPizzaById);

module.exports = router;
