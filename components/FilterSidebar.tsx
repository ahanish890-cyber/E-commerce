import React from 'react';
import { FilterState } from '../types';
import { GENDER_TABS, SUBCATEGORIES_BY_GENDER } from '../constants';
import { RotateCcw, Search, Sparkles, ChevronRight, X } from 'lucide-react';

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
  const currentGender = filters.gender || 'all';
  const subcategories = SUBCATEGORIES_BY_GENDER[currentGender] || SUBCATEGORIES_BY_GENDER['all'] || [];

  const isFilterActive = 
    filters.subcategory !== 'all' || 
    Boolean(filters.search && filters.search.trim()) ||
    (filters.gender !== 'all' && filters.gender !== undefined);

  return (
    <aside className="w-full md:w-64 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">Catalogue</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{totalProducts} {totalProducts === 1 ? 'garment' : 'garments'} found</p>
        </div>
        {isFilterActive && (
          <button
            onClick={onClearFilters}
            className="text-xs text-[#007185] hover:text-[#c45500] hover:underline flex items-center gap-1 font-bold cursor-pointer transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Active Search Badge */}
      {filters.search && filters.search.trim() && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-800 font-medium truncate mr-2">
            <Search size={13} className="text-[#e77600] shrink-0" />
            <span className="truncate">"{filters.search}"</span>
          </div>
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Department Selector */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Department</h4>
        <div className="space-y-1">
          {GENDER_TABS.map(tab => {
            const isActive = (filters.gender || 'all') === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange({ gender: tab.id as any, subcategory: 'all' })}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#131921] text-white shadow-xs' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#febd69]"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clothing Subcategories */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Clothing Category</h4>
          {filters.subcategory !== 'all' && (
            <button
              onClick={() => onFilterChange({ subcategory: 'all' })}
              className="text-[11px] text-[#007185] hover:underline font-medium"
            >
              All
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
          {subcategories.map(sub => {
            const isSubActive = (filters.subcategory || 'all') === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onFilterChange({ subcategory: sub.id })}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isSubActive
                    ? 'bg-orange-50 text-[#c45500] font-bold border-l-3 border-[#e77600]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{sub.label}</span>
                {isSubActive && <ChevronRight size={12} className="text-[#e77600]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stylist Assistant Prompt Card */}
      <div className="p-3.5 bg-gradient-to-br from-[#131921] to-[#232f3e] text-white rounded-xl shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-[#febd69] font-bold text-xs">
          <Sparkles size={14} />
          <span>Need Style Advice?</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-snug">
          Ask our AI Stylist for outfit pairings based on occasions, traditional Indian wear, or your INR budget.
        </p>
      </div>
    </aside>
  );
};
