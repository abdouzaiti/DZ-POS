import { useState, useCallback, useMemo, useEffect } from 'react';
import { Product, CartItem, Sale } from '../types';
import { useProducts } from '../contexts/ProductsContext';

export function usePOS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = localStorage.getItem('propos_sales');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored sales:", e);
      }
    }
    
    // Seed default sales for realistic statistics initially
    const today = new Date();
    const seeds: Sale[] = [
      {
        id: "TX-541324",
        sequentialId: 5,
        items: [
          { id: "1", name: "Selecto 1.5L", price: 135, quantity: 2, stock: 45, category: "Drinks" as any, barcode: "6130001001" },
          { id: "b1", name: "Baguette Pain Blanc", price: 15, quantity: 3, stock: 1000, category: "Bakery" as any, barcode: "" }
        ],
        total: 315,
        date: new Date(new Date().setHours(8, 15, 0, 0)).toISOString(),
        paymentMethod: "Cash"
      },
      {
        id: "TX-541325",
        sequentialId: 4,
        items: [
          { id: "w1", name: "Ifri Eau 5L", price: 130, quantity: 1, stock: 80, category: "Drinks" as any, barcode: "" },
          { id: "e1", name: "Oeufs (Unité)", price: 18, quantity: 10, stock: 1500, category: "Dairy" as any, barcode: "" }
        ],
        total: 310,
        date: new Date(new Date().setHours(11, 40, 0, 0)).toISOString(),
        paymentMethod: "Cash"
      },
      {
        id: "TX-541326",
        sequentialId: 3,
        items: [
          { id: "o1", name: "Huile Elio 5L", price: 650, quantity: 2, stock: 30, category: "Grocery" as any, barcode: "6130003004" }
        ],
        total: 1300,
        date: new Date(new Date().setHours(13, 20, 0, 0)).toISOString(),
        paymentMethod: "Cash"
      },
      {
        id: "TX-541327",
        sequentialId: 2,
        items: [
          { id: "m1", name: "Lait en Sachet (Colombe)", price: 25, quantity: 4, stock: 500, category: "Dairy" as any, barcode: "" },
          { id: "b2", name: "Pain Matlou3", price: 35, quantity: 2, stock: 200, category: "Bakery" as any, barcode: "" }
        ],
        total: 170,
        date: new Date(new Date().setHours(16, 55, 0, 0)).toISOString(),
        paymentMethod: "Cash"
      },
      {
        id: "TX-541328",
        sequentialId: 1,
        items: [
          { id: "fv4", name: "Bananes", price: 450, quantity: 1.5, stock: 50, category: "Fruits_Veggies" as any, barcode: "" }
        ],
        total: 675,
        date: new Date(new Date().setHours(19, 10, 0, 0)).toISOString(),
        paymentMethod: "Cash"
      }
    ];
    localStorage.setItem('propos_sales', JSON.stringify(seeds));
    return seeds;
  });

  // Sync with Electron DB for complete sales histories
  useEffect(() => {
    const loadSales = async () => {
      if (window.electronAPI) {
        try {
          const electronSales = await window.electronAPI.getSales();
          if (electronSales && electronSales.length > 0) {
            setSales(electronSales);
          }
        } catch (e) {
          console.error("Failed to load sales via Electron IPC:", e);
        }
      }
    };
    loadSales();
  }, []);

  const { decrementStock } = useProducts();

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

    decrementStock(cart.map(item => ({ id: item.id, quantity: item.quantity })));
    setSales(prev => {
      const updated = [newSale, ...prev];
      localStorage.setItem('propos_sales', JSON.stringify(updated));
      if (window.electronAPI) {
        window.electronAPI.saveSales(updated).catch(e => console.error("Electron failed saving sale:", e));
      }
      return updated;
    });
    clearCart();
    return newSale;
  }, [cart, total, clearCart, sales, decrementStock]);

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
