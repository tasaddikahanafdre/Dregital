'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant } from './types';

export interface CartItem {
  id: string; // unique item id (composite of product.id + variant?.id + options)
  product: Product;
  quantity: number;
  variant?: ProductVariant | null;
  selected_options?: Record<string, string>;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product, 
    quantity?: number, 
    variant?: ProductVariant | null, 
    selectedOptions?: Record<string, string>
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  freeShippingProgress: number; // 0 to 100%
  amountUntilFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const freeShippingThreshold = 3000;

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dregital_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cart from storage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on cart change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('dregital_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart to storage:', e);
      }
    }
  }, [cart, isHydrated]);

  const addToCart = (
    product: Product, 
    quantity = 1, 
    variant: ProductVariant | null = null,
    selectedOptions?: Record<string, string>
  ) => {
    const optionsKey = selectedOptions && Object.keys(selectedOptions).length > 0
      ? Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|')
      : '';
    const itemId = `${product.id}${variant ? `-${variant.id}` : ''}${optionsKey ? `-${optionsKey}` : ''}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { id: itemId, product, quantity, variant, selected_options: selectedOptions }];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
  const amountUntilFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold,
        freeShippingProgress,
        amountUntilFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
