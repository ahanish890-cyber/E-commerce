import { Product, FilterState } from '../types';

export function filterAndSortCatalog(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  // 1. Department / Gender Filtering (Strict Women, Men, All)
  if (filters.gender && filters.gender !== 'all') {
    const gen = filters.gender.toLowerCase();
    if (gen === 'women') {
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        return pg === 'women' || pg === 'unisex';
      });
    } else if (gen === 'men') {
      result = result.filter(p => {
        const pg = (p.gender || '').toLowerCase();
        return pg === 'men' || pg === 'unisex';
      });
    }
  }

  // 2. Subcategory filtering (handles both underscores and hyphens)
  if (filters.subcategory && filters.subcategory !== 'all') {
    const sub = filters.subcategory.toLowerCase();
    const subUnderscore = sub.replace(/-/g, '_');
    const subHyphen = sub.replace(/_/g, '-');
    result = result.filter(p => {
      const pSub = (p.subcategory || '').toLowerCase();
      if (pSub === sub || pSub === subUnderscore || pSub === subHyphen) return true;
      if (subUnderscore === 'casual_shirts') return pSub === 'casual_shirts';
      if (subUnderscore === 'formal_shirts') return pSub === 'formal_shirts';
      if (subUnderscore === 'polo_tshirts') return pSub === 'polo_tshirts';
      if (subUnderscore === 'ethnic_sets') return pSub === 'ethnic_sets';
      if (subUnderscore === 'coord_sets') return pSub === 'coord_sets';
      if (sub === 'shirts') return pSub === 'shirts' || pSub === 'casual_shirts' || pSub === 'formal_shirts';
      if (sub === 'jackets') return pSub === 'jackets' || pSub === 'coats';
      if (sub === 'kurtas') return pSub === 'kurtas' || pSub === 'kurtis';
      return false;
    });
  }

  // 3. Search query
  if (filters.search && filters.search.trim()) {
    const queryWords = filters.search.toLowerCase().trim().split(/\s+/);
    result = result.filter(p => {
      const text = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.description || ''} ${p.material || ''} ${p.style || ''} ${p.occasion || ''}`.toLowerCase();
      return queryWords.every(word => text.includes(word));
    });
  }

  // 4. Sorting
  if (filters.sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating') {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (filters.sortBy === 'newest') {
    result.reverse();
  }

  return result;
}
