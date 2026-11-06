import React, { useState, useMemo } from 'react';
import { Item, FilterOptions } from '../../types';
import { ItemCard } from '../items/ItemCard';
import { ItemFilterBar } from '../items/ItemFilterBar';
import { itemService } from '../../services/itemService';
import { PlusCircle, Search, AlertCircle } from 'lucide-react';

interface LostItemsPageProps {
  onViewItem: (itemId: string) => void;
  onReportLost: () => void;
  initialFilters?: Partial<FilterOptions>;
}

export const LostItemsPage: React.FC<LostItemsPageProps> = ({
  onViewItem,
  onReportLost,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: initialFilters?.searchQuery || '',
    category: initialFilters?.category || 'All',
    location: initialFilters?.location || '',
    dateFrom: initialFilters?.dateFrom || '',
    dateTo: initialFilters?.dateTo || '',
    sortBy: 'newest',
    status: 'All',
  });

  const filteredItems = useMemo(() => {
    return itemService.getItems(filters, 'lost');
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full">
            Missing Possessions
          </span>
          <h1 className="text-3xl font-bold text-[#202B25] mt-2">
            Lost Items Directory
          </h1>
          <p className="text-sm text-[#78847D] mt-1">
            Browse belongings reported lost by community members. If you found any of these, notify the owner!
          </p>
        </div>

        <button
          onClick={onReportLost}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Lost Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ItemFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={filteredItems.length}
        itemTypeLabel="lost items"
      />

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewItem}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8F5EC] p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#202B25]">No lost items found</h3>
          <p className="text-xs text-[#78847D] leading-relaxed">
            No items matched your current search filters. Try clearing some criteria or reporting your own missing item.
          </p>
          <button
            onClick={() =>
              setFilters({
                searchQuery: '',
                category: 'All',
                location: '',
                dateFrom: '',
                dateTo: '',
                sortBy: 'newest',
                status: 'All',
              })
            }
            className="px-4 py-2 text-xs font-semibold text-[#238B57] bg-[#E8F5EC] rounded-xl hover:bg-[#d5ecdc] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
};

