import React, { useState } from 'react';
import { FilterOptions, ItemCategory } from '../../types';
import { Search, MapPin, Calendar, Filter, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const CATEGORIES: (ItemCategory | 'All')[] = [
  'All',
  'Electronics',
  'Wallets & Purses',
  'Keys',
  'Bags & Backpacks',
  'Documents & IDs',
  'Jewelry & Watches',
  'Clothing & Accessories',
  'Pets',
  'Books & Notebooks',
  'Other',
];

interface ItemFilterBarProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  totalCount: number;
  itemTypeLabel?: string;
}

export const ItemFilterBar: React.FC<ItemFilterBarProps> = ({
  filters,
  onChange,
  totalCount,
  itemTypeLabel = 'items',
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (val: string) => {
    onChange({ ...filters, searchQuery: val });
  };

  const handleCategoryChange = (val: string) => {
    onChange({ ...filters, category: val });
  };

  const handleLocationChange = (val: string) => {
    onChange({ ...filters, location: val });
  };

  const handleReset = () => {
    onChange({
      searchQuery: '',
      category: 'All',
      location: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest',
      status: 'All',
    });
  };

  const isFiltered =
    filters.searchQuery ||
    filters.category !== 'All' ||
    filters.location ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.status !== 'All';

  return (
    <div className="bg-white rounded-2xl border border-[#E8F5EC] p-4 sm:p-5 shadow-xs mb-8 space-y-4">
      {/* Top Search & Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Main Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#78847D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by item name, keywords..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] transition-all bg-[#F9FBF9]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="md:col-span-4">
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9] transition-all"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons / Toggle Advanced */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showAdvanced || filters.location || filters.dateFrom
                ? 'bg-[#E8F5EC] border-[#238B57]/40 text-[#238B57]'
                : 'border-gray-200 text-[#78847D] hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>

          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Expandable Row */}
      {showAdvanced && (
        <div className="pt-4 border-t border-[#E8F5EC] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
          
          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78847D] uppercase tracking-wider mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-[#78847D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Metro, Library..."
                value={filters.location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#238B57] text-xs text-[#202B25] bg-[#F9FBF9]"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78847D] uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#238B57] text-xs text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78847D] uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#238B57] text-xs text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-[#78847D] uppercase tracking-wider mb-1">
              Sort By Date
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as 'newest' | 'oldest' })}
              aria-label="Sort by date"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#238B57] text-xs text-[#202B25] bg-[#F9FBF9]"
            >
              <option value="newest">Newest Reported</option>
              <option value="oldest">Oldest Reported</option>
            </select>
          </div>
        </div>
      )}

      {/* Result Count and Active Filters Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#78847D]">
        <div>
          Showing <span className="font-semibold text-[#202B25]">{totalCount}</span> {itemTypeLabel}
        </div>
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.category !== 'All' && (
              <span className="bg-[#E8F5EC] text-[#238B57] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                Category: {filters.category}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleCategoryChange('All')}
                />
              </span>
            )}
            {filters.location && (
              <span className="bg-[#E8F5EC] text-[#238B57] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                Near: {filters.location}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleLocationChange('')}
                />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

