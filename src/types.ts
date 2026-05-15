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
