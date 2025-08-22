import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.find(item => 
        item.id === action.item.id && item.grade === action.item.grade
      );
      
      if (existingItem) {
        return state.map(item =>
          item.id === action.item.id && item.grade === action.item.grade
            ? { ...item, quantity: item.quantity + action.item.quantity }
            : item
        );
      }
      return [...state, action.item];

    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.id && item.grade === action.grade
          ? { ...item, quantity: Math.max(0, action.quantity) }
          : item
      ).filter(item => item.quantity > 0);

    case 'REMOVE_FROM_CART':
      return state.filter(item => 
        !(item.id === action.id && item.grade === action.grade)
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', item });
  };

  const updateQuantity = (id, grade, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, grade, quantity });
  };

  const removeFromCart = (id, grade) => {
    dispatch({ type: 'REMOVE_FROM_CART', id, grade });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
