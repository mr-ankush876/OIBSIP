const mongoose = require('mongoose');

const pizzaRecipeItemSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Pizza description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Veg', 'Non-Veg', 'Special', 'Bestseller'],
      default: 'Veg',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: true,
    },
    dietaryTags: {
      type: [String],
      default: ['Vegetarian'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    recipe: [pizzaRecipeItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pizza', pizzaSchema);
