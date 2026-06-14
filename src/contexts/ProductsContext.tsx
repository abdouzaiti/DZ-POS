import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../types';
import { MOCK_PRODUCTS } from '../mockData';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  decrementStock: (items: { id: string; quantity: number }[]) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const saveProducts = useCallback(async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('propos_products', JSON.stringify(updatedProducts));
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveProducts(updatedProducts);
      } catch (e) {
        console.error("Electron IPC products save error:", e);
      }
    }
  }, []);

  // Load products from localStorage or use MOCK_PRODUCTS
  useEffect(() => {
    const loadProducts = async () => {
      if (window.electronAPI) {
        try {
          const electronProducts = await window.electronAPI.getProducts();
          if (electronProducts && electronProducts.length > 0) {
            setProducts(electronProducts);
            return;
          }
        } catch (e) {
          console.error("Failed to load products from Electron IPC, falling back:", e);
        }
      }

      const stored = localStorage.getItem('propos_products');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProducts(parsed);
        } catch (e) {
          console.error("Failed to parse stored products:", e);
          initializeFromMock();
        }
      } else {
        initializeFromMock();
      }
    };

    loadProducts();
  }, []);

  const initializeFromMock = () => {
    // Generate default purchasePrice for mock products if not present
    const initialized = MOCK_PRODUCTS.map(p => ({
      ...p,
      purchasePrice: p.purchasePrice ?? Math.round(p.price * 0.7)
    }));
    saveProducts(initialized);
  };

  // Add Product
  const addProduct = useCallback((newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: 'prod_' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      saveProducts(updated);
      return updated;
    });
    return newProduct;
  }, [saveProducts]);

  // Update Product
  const updateProduct = useCallback((id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      saveProducts(updated);
      return updated;
    });
  }, [saveProducts]);

  // Delete Product
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveProducts(updated);
      return updated;
    });
  }, [saveProducts]);

  // Decrement Stock
  const decrementStock = useCallback((items: { id: string; quantity: number }[]) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        const saleItem = items.find(item => item.id === p.id);
        if (saleItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - saleItem.quantity)
          };
        }
        return p;
      });
      saveProducts(updated);
      return updated;
    });
  }, [saveProducts]);

  return (
    <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, decrementStock }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
