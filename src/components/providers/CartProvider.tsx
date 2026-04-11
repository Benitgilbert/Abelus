"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, ProductPackaging } from '@/types';

export interface CartItem {
  id: string; // Composite ID: variantId-unitId (or 'base')
  product: Product;
  variant: ProductVariant;
  unit?: ProductPackaging;
  quantity: number;
  price: number; // Price per unit/piece at time of add
  wishes: Record<string, any>;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, variant: ProductVariant, unit?: ProductPackaging, quantity?: number) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('pastor_bonus_public_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('pastor_bonus_public_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addItem = (product: Product, variant: ProductVariant, unit?: ProductPackaging, quantity: number = 1) => {
    const cartId = `${variant.id}-${unit?.id || 'base'}`;
    const price = unit ? Number(unit.selling_price) : Number(variant.selling_price);

    setCart(prev => {
      const existing = prev.find(item => item.id === cartId);
      if (existing) {
        return prev.map(item => 
          item.id === cartId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { 
        id: cartId, 
        product, 
        variant, 
        unit, 
        quantity, 
        price,
        wishes: {} 
      }];
    });
  };

  const removeItem = (cartId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(cartId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.id === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      itemCount, 
      totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
