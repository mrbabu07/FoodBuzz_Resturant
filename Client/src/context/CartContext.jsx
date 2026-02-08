import React, { createContext, useContext, useState } from "react";
import { showCartAdded, showCartRemoved } from "../utils/toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, qty = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    showCartAdded(item.name);
  };

  const removeFromCart = (name) => {
    setCartItems((prev) => prev.filter((i) => i.name !== name));
    showCartRemoved(name);
  };

  const increaseQty = (name) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.name === name ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  };

  const decreaseQty = (name) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.name === name
          ? { ...i, quantity: i.quantity > 1 ? i.quantity - 1 : 1 }
          : i,
      ),
    );
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems, // একদম দরকার
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
