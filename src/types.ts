export enum Category {
  DRINKS = "Drinks",
  DAIRY = "Dairy",
  BAKERY = "Bakery",
  GROCERY = "Grocery",
  SNACKS = "Snacks",
  CLEANING = "Cleaning",
  FRUITS_VEGGIES = "Fruits & Veggies",
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
  image?: string;
  unit?: "unit" | "kg" | "g" | "plate";
  isQuick?: boolean;
  purchasePrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  sequentialId: number;
  items: CartItem[];
  total: number;
  date: string;
  paymentMethod: string;
}

export interface Credit {
  id: string;
  customerName: string;
  date: string;
  total: number;
  items: CartItem[];
  sequentialId: number;
  ticketId: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getProducts: () => Promise<Product[]>;
      saveProducts: (products: Product[]) => Promise<void>;
      getSales: () => Promise<Sale[]>;
      saveSales: (sales: Sale[]) => Promise<void>;
      getCredits: () => Promise<any[]>;
      saveCredits: (credits: any[]) => Promise<void>;
      getSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<void>;
    };
  }
}

