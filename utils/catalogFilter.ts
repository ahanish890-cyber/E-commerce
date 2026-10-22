import { Product, FilterState } from '../types';

export const COLOR_FAMILY_MAP: Record<string, string[]> = {
  red: ['red', 'burgundy', 'maroon', 'ruby', 'scarlet', 'crimson'],
  blue: ['blue', 'navy', 'indigo', 'teal', 'sky blue', 'midnight blue'],
  green: ['green', 'emerald', 'sage', 'olive'],
  brown: ['brown', 'tan', 'cognac', 'camel', 'chocolate', 'espresso'],
  white: ['white', 'ivory', 'cream'],
  black: ['black', 'charcoal', 'onyx'],
  beige: ['beige', 'sand', 'nude', 'khaki'],
  navy: ['navy', 'midnight navy']
};

export function matchesColorTerm(productColors: string[] = [], selectedColorName: string): boolean {
  const norm = selectedColorName.trim().toLowerCase();
  const searchTerms = COLOR_FAMILY_MAP[norm] || [norm];
  
  return productColors.some(pc => {
    const pcLow = pc.toLowerCase();
    if (pcLow.includes(norm)) return true;
    return searchTerms.some(term => pcLow.includes(term));
  });
}

export function filterAndSortCatalog(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  // 1. Department / Gender Isolation
  if (filters.gender && filters.gender !== 'all') {
    const gen = filters.gender.toLowerCase();
    if (gen === 'footwear') {
      result = result.filter(p => (p.category || '').toLowerCase() === 'footwear');
    } else if (gen === 'accessories') {
      result = result.filter(p => (p.category || '').toLowerCase() === 'accessories');
    } else if (gen === 'women') {
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        return pg === 'women' || pg === 'unisex';
      });
    } else if (gen === 'men') {
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        return pg === 'men' || pg === 'unisex';
      });
    } else if (gen === 'kids') {
      result = result.filter(p => (p.gender || '').toLowerCase() === 'kids');
    } else if (gen === 'unisex') {
      result = result.filter(p => (p.gender || '').toLowerCase() === 'unisex');
    }
  }

  // 2. Category filtering
  if (filters.category && filters.category !== 'all') {
    const c = filters.category.toLowerCase();
    result = result.filter(p => (p.category || '').toLowerCase() === c);
  }

  // 3. Subcategory filtering
  if (filters.subcategory && filters.subcategory !== 'all') {
    const sub = filters.subcategory.toLowerCase();
    result = result.filter(p => {
      const pSub = (p.subcategory || '').toLowerCase();
      if (sub === 'dresses') return pSub === 'dresses';
      if (sub === 'shirts') {
        return pSub === 'shirts' || (filters.gender === 'all' && pSub === 'tops');
      }
      if (sub === 'tops') return pSub === 'tops';
      if (sub === 'jackets') return pSub === 'jackets' || pSub === 'coats';
      if (sub === 'jeans') return pSub === 'jeans' || pSub === 'denim';
      if (sub === 'sneakers') return pSub === 'sneakers';
      if (sub === 'bags') return pSub === 'bags' || pSub === 'totes' || pSub === 'handbags';
      return pSub === sub;
    });
  }

  // 3. Search query
  if (filters.search && filters.search.trim()) {
    const queryWords = filters.search.toLowerCase().trim().split(/\s+/);
    result = result.filter(p => {
      const text = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.description || ''} ${p.material || ''} ${p.style || ''} ${p.occasion || ''} ${(p.colors || []).join(' ')}`.toLowerCase();
      return queryWords.every(word => text.includes(word));
    });
  }

  // 4. Price range
  if (filters.minPrice !== undefined) {
    result = result.filter(p => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter(p => p.price <= filters.maxPrice!);
  }

  // 5. Sizes (OR logic within sizes group)
  const targetSizes: string[] = filters.sizes && filters.sizes.length > 0 
    ? filters.sizes 
    : (filters.size ? filters.size.split(',').map(s => s.trim()) : []);

  if (targetSizes.length > 0) {
    result = result.filter(p => 
      p.sizes && p.sizes.some(s => targetSizes.includes(s))
    );
  }

  // 6. Colors (OR logic within colors group with color family matching)
  const targetColors: string[] = filters.colors && filters.colors.length > 0 
    ? filters.colors 
    : (filters.color ? filters.color.split(',').map(c => c.trim()) : []);

  if (targetColors.length > 0) {
    result = result.filter(p => 
      targetColors.some(selectedColor => matchesColorTerm(p.colors, selectedColor))
    );
  }

  // 7. Rating
  if (filters.minRating !== undefined) {
    result = result.filter(p => (p.rating || 0) >= filters.minRating!);
  }

  // 8. Virtual Try-On Ready
  if (filters.hasTryOn) {
    result = result.filter(p => Boolean(p.hasTryOn));
  }

  // 9. Availability: In Stock Only
  if (filters.inStock) {
    result = result.filter(p => {
      if (!p.stock) return true;
      const totalStock = Object.values(p.stock).reduce((a, b) => a + Number(b), 0);
      return totalStock > 0;
    });
  }

  // 10. Sorting
  if (filters.sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters.sortBy === 'newest') {
    result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }

  return result;
}
