import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from './update_products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const constantsPath = path.resolve(__dirname, '../constants.tsx');

const content = `import { Product } from './types';

export const DEFAULT_PRODUCT_IMAGE = '/fallback-product.svg';

export interface CategoryOption {
  id: string;
  label: string;
  subcategory?: string;
  category?: string;
}

export const GENDER_TABS = [
  { id: 'all', label: 'All Clothing' },
  { id: 'women', label: "Women's Fashion" },
  { id: 'men', label: "Men's Fashion" }
];

export const SUBCATEGORIES_BY_GENDER: Record<string, CategoryOption[]> = {
  all: [
    { id: 'all', label: 'All Items' },
    { id: 'casual_shirts', label: 'Casual Shirts' },
    { id: 'formal_shirts', label: 'Formal Shirts' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'polo_tshirts', label: 'Polo T-Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'chinos', label: 'Chinos' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'sweatshirts', label: 'Sweatshirts' },
    { id: 'tops', label: 'Casual Tops' },
    { id: 'shirts', label: 'Shirts & Blouses' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'skirts', label: 'Skirts' },
    { id: 'kurtis', label: 'Kurtis' },
    { id: 'kurtas', label: 'Kurtas & Traditional' },
    { id: 'ethnic_sets', label: 'Ethnic Sets' },
    { id: 'coord_sets', label: 'Co-ord Sets' },
    { id: 'jackets', label: 'Jackets & Blazers' }
  ],
  women: [
    { id: 'all', label: 'All Women' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'tops', label: 'Casual Tops' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'shirts', label: 'Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'skirts', label: 'Skirts' },
    { id: 'kurtis', label: 'Kurtis' },
    { id: 'kurtas', label: 'Kurtas' },
    { id: 'ethnic_sets', label: 'Ethnic Sets' },
    { id: 'coord_sets', label: 'Co-ord Sets' },
    { id: 'jackets', label: 'Jackets & Blazers' }
  ],
  men: [
    { id: 'all', label: 'All Men' },
    { id: 'casual_shirts', label: 'Casual Shirts' },
    { id: 'formal_shirts', label: 'Formal Shirts' },
    { id: 't-shirts', label: 'T-Shirts' },
    { id: 'polo_tshirts', label: 'Polo T-Shirts' },
    { id: 'jeans', label: 'Jeans' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'chinos', label: 'Chinos' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'sweatshirts', label: 'Sweatshirts' },
    { id: 'jackets', label: 'Jackets' },
    { id: 'kurtas', label: 'Kurtas & Traditional' }
  ]
};

export const DEPARTMENT_SIZES: Record<string, string[]> = {
  all: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44'],
  women: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32'],
  men: ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38', '40', '42', '44']
};

export const FILTER_SIZES = DEPARTMENT_SIZES.all;

export const FILTER_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Brown', hex: '#78350F' }
];

export const MOCK_PRODUCTS: Product[] = ` + JSON.stringify(PRODUCTS, null, 2) + `;\n`;

fs.writeFileSync(constantsPath, content, 'utf-8');
console.log('✅ constants.tsx successfully updated with 31 clean clothing items!');

