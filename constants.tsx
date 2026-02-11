
import { Product } from './types';

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1000&fit=crop';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Urban Trench Coat',
    brand: 'OmniLux',
    price: 189.99,
    rating: 4.8,
    reviewCount: 1240,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop',
    category: 'Outerwear',
    description: 'A timeless silhouette engineered for the modern professional. Water-resistant and breathable.',
    colors: ['Beige', 'Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    hasTryOn: true
  },
  {
    id: '2',
    name: 'Merino Wool Evening Sweater',
    brand: 'Elegance Elite',
    price: 85.00,
    rating: 4.5,
    reviewCount: 890,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1000&fit=crop',
    category: 'Knitwear',
    description: 'Ethically sourced merino wool offering unparalleled comfort and a slim, flattering fit.',
    colors: ['Grey', 'Charcoal', 'Burgundy'],
    sizes: ['XS', 'S', 'M', 'L'],
    hasTryOn: true
  },
  {
    id: '3',
    name: 'Performance Dry-Fit Active Tee',
    brand: 'Velocity',
    price: 34.50,
    rating: 4.9,
    reviewCount: 2300,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop',
    category: 'Activewear',
    description: 'Moisture-wicking fabric that moves with you. Perfect for high-intensity training.',
    colors: ['White', 'Black', 'Volt'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    hasTryOn: true
  },
  {
    id: '4',
    name: 'Slim Fit Oxford Shirt',
    brand: 'Heritage',
    price: 59.99,
    rating: 4.4,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?w=800&h=1000&fit=crop',
    category: 'Shirts',
    description: 'A versatile staple for business or casual wear. Reinforced stitching and pearl buttons.',
    colors: ['Light Blue', 'White'],
    sizes: ['15', '16', '17', '18'],
    hasTryOn: false
  },
  {
    id: '5',
    name: 'Sustainable Denim Jacket',
    brand: 'EcoFit',
    price: 120.00,
    rating: 4.7,
    reviewCount: 450,
    image: 'https://images.unsplash.com/photo-1576905341939-402ddec3518b?w=800&h=1000&fit=crop',
    category: 'Outerwear',
    description: 'Crafted from organic cotton denim with recycled metal hardware. Built to last a lifetime.',
    colors: ['Indigo', 'Light Wash'],
    sizes: ['M', 'L', 'XL'],
    hasTryOn: true
  },
  {
    id: '6',
    name: 'Linen Summer Trousers',
    brand: 'Coastal',
    price: 75.00,
    rating: 4.2,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1000&fit=crop',
    category: 'Pants',
    description: 'Breathable linen-blend trousers with a relaxed tapered fit. Ideal for warm climates.',
    colors: ['Sand', 'Khaki'],
    sizes: ['30', '32', '34', '36'],
    hasTryOn: false
  }
];
