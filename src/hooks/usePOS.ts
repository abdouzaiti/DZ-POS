import { useState, useCallback, useMemo } from 'react';
import { Product, CartItem, Sale } from '../types';

export function usePOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addToCart = useCallback((product: Product, quantity: number = 1, customPrice?: number) => {
    setCart(prev => {
      const price = customPrice ?? product.price;
      // Note: we might want to distinguish items even if they have the same ID but different custom prices
      const existing = prev.find(item => item.id === product.id && item.price === price);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.price === price) ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, price, quantity }];
    });
  }, []);

  const setManualQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter(item => item.quantity > 0) as CartItem[]);
  }, []);

  const setManualPrice = useCallback((productId: string, price: number) => {
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, price: Math.max(0, price) } : item
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const subtotal = total / 1.19; // Price before tax
  const tax = total - subtotal; // Amount of tax included in total

  const completeSale = useCallback((paymentMethod: string) => {
    if (cart.length === 0) return;
    
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      sequentialId: sales.length + 1,
      items: [...cart],
      total,
      date: new Date().toISOString(),
      paymentMethod,
    };

    setSales(prev => [newSale, ...prev]);
    clearCart();
    return newSale;
  }, [cart, total, clearCart, sales]);

  return {
    cart,
    addToCart,
    setManualQuantity,
    setManualPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    total,
    completeSale,
    sales,
  };
}
