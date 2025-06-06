// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
// The default value [] is used when a component consumes context without a provider
const CartContext = createContext([]);

// 2. Create the CartProvider Component
// This component will wrap your application (or parts of it)
// and provide the cart state and functions to its children.
export const CartProvider = ({ children }) => {

  // here we are going to add a new feature of local storage,, we try to load the cart from local, if its empty then we just an empty cart,, 
  const [cart, setCart] = useState(() =>{
    try{
      const storedCart = localStorage.getItem('ecomCart');
      return storedCart ? JSON.parse(storedCart) : [];
    }catch(err){
      console.log("Failed to parse cart from local storage", err);
      return []
    }
  });

  useEffect(() =>{
    try{
      localStorage.setItem('ecomCart', JSON.stringify(cart));
    }catch(error){console.log("Failed to save the cart in local storage", error)}
  },[cart]);

  const addToCart = (productToAdd) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === productToAdd.id);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        return [...prevCart, { productId: productToAdd.id, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, change) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const currentQuantity = updatedCart[existingItemIndex].quantity;

        if (currentQuantity + change <= 0) {
          return prevCart.filter(item => item.productId !== productId);
        } else {
          updatedCart[existingItemIndex].quantity += change;
          return updatedCart;
        }
      }
      return prevCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // 3. The value prop of the Provider passes the data and functions down
  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, updateQuantity, removeFromCart, totalCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

// 4. Custom Hook for easy consumption of the CartContext
// This makes it cleaner to use the context in components
export const useCart = () => {
  return useContext(CartContext);
};