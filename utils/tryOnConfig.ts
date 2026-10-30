import { Product } from '../types';

export interface TryOnProduct {
  id: string;
  catalogId: string;
  name: string;
  brand: string;
  price: number;
  productImage: string;
  demoPhoto: string;
  resultImage: string;
  supported: boolean;
  description: string;
  gender: 'men' | 'women';
  details?: {
    fit: string;
    material: string;
    pattern: string;
  };
}

export const tryOnProducts: Record<string, TryOnProduct> = {
  redCheckeredShirt: {
    id: 'redCheckeredShirt',
    catalogId: 'm-shirt-1',
    name: "Men's Classic Plaid Flannel Casual Shirt",
    brand: 'OmniFit Classic',
    price: 1899,
    productImage: '/images/red-checkered-shirt.png',
    demoPhoto: '/images/boy-original.png',
    resultImage: '/images/boy-checkered-shirt.png',
    supported: true,
    description: 'Red-and-black buffalo-check, long-sleeved, button-up shirt in premium flannel.',
    gender: 'men',
    details: {
      fit: 'Regular Fit',
      material: '100% Brushed Cotton Flannel',
      pattern: 'Buffalo Check Plaid'
    }
  },

  rustBlouse: {
    id: 'rustBlouse',
    catalogId: 'w-top-3',
    name: "Boho Embroidered Smocked Peplum Top",
    brand: 'OmniFit Studio',
    price: 1299,
    productImage: '/images/rust-blouse.png',
    demoPhoto: '/images/woman-original.png',
    resultImage: '/images/woman-rust-blouse.png',
    supported: true,
    description: 'Rust-colored blouse featuring cream floral embroidery, square neckline, smocked bodice, puff sleeves, and a tiered hem.',
    gender: 'women',
    details: {
      fit: 'Smocked Flared Hem',
      material: 'Earth-Toned Rayon Blend',
      pattern: 'Floral Embroidery'
    }
  }
};

/**
 * Finds the matching TryOn configuration for a given product.
 */
export function getTryOnConfigForProduct(
  product: Product | { id: string; name?: string; image?: string } | null | undefined
): TryOnProduct | null {
  if (!product) return null;

  // Direct match by ID or catalogId
  if (product.id === 'm-shirt-1' || product.id === 'redCheckeredShirt') {
    return tryOnProducts.redCheckeredShirt;
  }
  if (product.id === 'w-top-3' || product.id === 'rustBlouse') {
    return tryOnProducts.rustBlouse;
  }

  // Name or Image heuristic match
  const nameLower = (product.name || '').toLowerCase();
  const imageLower = (product.image || '').toLowerCase();

  if (
    nameLower.includes('plaid flannel') ||
    nameLower.includes('checkered shirt') ||
    imageLower.includes('m-flannel-shirt') ||
    imageLower.includes('red-checkered-shirt')
  ) {
    return tryOnProducts.redCheckeredShirt;
  }

  if (
    nameLower.includes('peplum') ||
    nameLower.includes('rust') ||
    imageLower.includes('w-peplum-top') ||
    imageLower.includes('rust-blouse')
  ) {
    return tryOnProducts.rustBlouse;
  }

  return null;
}

export function isProductSupportedForTryOn(
  product: Product | { id: string; name?: string } | null | undefined
): boolean {
  return getTryOnConfigForProduct(product)?.supported ?? false;
}

export function getAllSupportedTryOnProducts(): TryOnProduct[] {
  return Object.values(tryOnProducts).filter(p => p.supported);
}

