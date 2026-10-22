export interface Product {
  id: string;
  name: string;
  brand: string;
  gender: 'women' | 'men' | 'kids' | 'unisex';
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  description: string;
  colors: string[];
  sizes: string[];
  stock?: Record<string, number>;
  rating: number;
  reviewCount: number;
  material?: string;
  fit?: string;
  occasion?: string;
  style?: string;
  seller?: string;
  returnEligibility?: string;
  hasTryOn: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Address {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
  addresses?: Address[];
  wishlist?: string[];
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: Address;
  deliveryMethod: string;
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested';
  timeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
  returnEligible: boolean;
  createdAt: string;
}

export enum ViewMode {
  Home,
  ProductDetail,
  Cart,
  Checkout,
  Orders,
  Admin,
  Wishlist
}

export interface FilterState {
  gender: 'all' | 'women' | 'men' | 'kids' | 'unisex' | 'footwear' | 'accessories';
  category: string;
  subcategory: string;
  search: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  sizes?: string[];
  colors?: string[];
  minRating?: number;
  hasTryOn?: boolean;
  inStock?: boolean;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
