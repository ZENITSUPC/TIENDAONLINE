export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount: number; // Percentage 0-100
  rating: number; // 0-5
  stock: number;
  description: string;
  image: string;
  isNew?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed';
  shippingDetails: {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
}

export type SortOption = 'price-asc' | 'price-desc' | 'popularity' | 'newest';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  minRating: number;
}