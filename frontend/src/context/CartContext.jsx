import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pizza_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pizza_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (newItem) => {
    setItems((prevItems) => {
      // If it's a standard menu pizza, check if it already exists to increment quantity
      if (!newItem.isCustom) {
        const existingIndex = prevItems.findIndex(
          (i) => !i.isCustom && i.pizza === newItem.pizza
        );
        if (existingIndex > -1) {
          const updated = [...prevItems];
          updated[existingIndex].quantity += newItem.quantity || 1;
          return updated;
        }
      }

      // If custom or not found, add as distinct item
      const itemWithId = {
        ...newItem,
        cartItemId: `${newItem.isCustom ? 'custom' : 'menu'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        quantity: newItem.quantity || 1,
      };
      return [...prevItems, itemWithId];
    });
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
