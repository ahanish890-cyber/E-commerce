
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  description: string;
  colors: string[];
  sizes: string[];
  hasTryOn: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum ViewMode {
  Home,
  ProductDetail,
  Cart,
  Checkout
}
