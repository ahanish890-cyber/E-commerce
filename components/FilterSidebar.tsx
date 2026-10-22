import React from 'react';
import { FilterState } from '../types';
import { FILTER_SIZES, FILTER_COLORS, DEPARTMENT_SIZES } from '../constants';
import { Star, Check, RotateCcw, Camera } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  totalProducts: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalProducts
}) => {
  const selectedSizes = filters.sizes && filters.sizes.length > 0
    ? filters.sizes
    : (filters.size ? filters.size.split(',').map(s => s.trim()) : []);

  const selectedColors = filters.colors && filters.colors.length > 0
    ? filters.colors
    : (filters.color ? filters.color.split(',').map(c => c.trim()) : []);

  const isFilterActive = 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined || 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    filters.minRating !== undefined || 
    Boolean(filters.hasTryOn) || 
    Boolean(filters.inStock);

  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 to $100', min: 50, max: 100 },
    { label: '$100 to $150', min: 100, max: 150 },
    { label: '$150 & Above', min: 150, max: 1000 }
  ];

  const availableSizes = DEPARTMENT_SIZES[filters.gender] || FILTER_SIZES;

  const toggleSize = (s: string) => {
    const isSelected = selectedSizes.includes(s);
    const next = isSelected ? selectedSizes.filter(x => x !== s) : [...selectedSizes, s];
    onFilterChange({
      sizes: next,
      size: next.length === 1 ? next[0] : (next.length === 0 ? undefined : next.join(','))
    });
  };

  const toggleColor = (colorName: string) => {
    const isSelected = selectedColors.some(c => c.toLowerCase() === colorName.toLowerCase());
    const next = isSelected
      ? selectedColors.filter(c => c.toLowerCase() !== colorName.toLowerCase())
      : [...selectedColors, colorName];
    onFilterChange({
      colors: next,
      color: next.length === 1 ? next[0] : (next.length === 0 ? undefined : next.join(','))
    });
  };

  return (
    <aside className="w-full md:w-64 bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-6 text-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Filters</h3>
          <p className="text-xs text-gray-500">{totalProducts} {totalProducts === 1 ? 'item' : 'items'} found</p>
        </div>
        {isFilterActive && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[#007185] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Virtual Try-On Toggle */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Feature</h4>
        <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(filters.hasTryOn)}
            onChange={(e) => onFilterChange({ hasTryOn: e.target.checked ? true : undefined })}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span className="flex items-center gap-1.5 font-medium text-xs">
            <Camera size={14} className="text-indigo-600" /> Virtual Try-On Ready
          </span>
        </label>
      </div>

      {/* In-Stock Toggle */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(filters.inStock)}
            onChange={(e) => onFilterChange({ inStock: e.target.checked ? true : undefined })}
            className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
          />
          <span className="text-xs text-gray-700 font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Price</h4>
        <div className="space-y-1.5">
          {priceRanges.map((range, idx) => {
            const isSelected = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onFilterChange({ minPrice: undefined, maxPrice: undefined });
                  } else {
                    onFilterChange({ minPrice: range.min, maxPrice: range.max });
                  }
                }}
                className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors cursor-pointer ${
                  isSelected ? 'bg-orange-50 font-bold text-[#b12704]' : 'text-gray-700 hover:text-[#007185]'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map(s => {
            const isSelected = selectedSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-2.5 py-1 text-xs border rounded transition-all font-medium cursor-pointer ${
                  isSelected 
                    ? 'border-[#e77600] bg-[#febd69]/30 text-gray-900 font-bold shadow-xs' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Color</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {FILTER_COLORS.map(c => {
            const isSelected = selectedColors.some(sc => sc.toLowerCase() === c.name.toLowerCase());
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c.name)}
                className={`flex items-center gap-2 p-1.5 rounded text-xs border text-left transition-all cursor-pointer ${
                  isSelected ? 'border-[#e77600] bg-orange-50 font-bold' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" 
                  style={{ backgroundColor: c.hex }} 
                />
                <span className="truncate text-gray-800">{c.name}</span>
                {isSelected && <Check size={12} className="ml-auto text-[#e77600]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Review Rating */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Customer Reviews</h4>
        <div className="space-y-1">
          {[4, 3, 2].map(r => {
            const isSelected = filters.minRating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onFilterChange({ minRating: isSelected ? undefined : r })}
                className={`flex items-center gap-1.5 w-full text-xs p-1 rounded transition-colors ${
                  isSelected ? 'bg-orange-50 font-bold' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex text-[#f08804]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < r ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-gray-700">& Up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note: Brand Filter is explicitly omitted from sidebar per user instructions */}
    </aside>
  );
};
