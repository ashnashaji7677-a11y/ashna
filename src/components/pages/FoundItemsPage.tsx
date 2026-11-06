import React, { useState, useMemo } from 'react';
import { Item, FilterOptions } from '../../types';
import { ItemCard } from '../items/ItemCard';
import { ItemFilterBar } from '../items/ItemFilterBar';
import { itemService } from '../../services/itemService';
import { PlusCircle, Search, ShieldCheck } from 'lucide-react';

interface FoundItemsPageProps {
  onViewItem: (itemId: string) => void;
  onReportFound: () => void;
  initialFilters?: Partial<FilterOptions>;
}

export const FoundItemsPage: React.FC<FoundItemsPageProps> = ({
  onViewItem,
  onReportFound,
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
    return itemService.getItems(filters, 'found');
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#238B57] uppercase tracking-wider bg-[#E8F5EC] px-3 py-1 rounded-full">
            Recovered Belongings
          </span>
          <h1 className="text-3xl font-bold text-[#202B25] mt-2">
            Found Items Directory
          </h1>
          <p className="text-sm text-[#78847D] mt-1">
            Items turned in by community finders. See something that belongs to you? Submit your ownership proof to claim it!
          </p>
        </div>

        <button
          onClick={onReportFound}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-semibold text-sm transition-all shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Found Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ItemFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={filteredItems.length}
        itemTypeLabel="found items"
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
          <div className="w-16 h-16 rounded-full bg-[#E8F5EC] text-[#238B57] flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#202B25]">No found items matching criteria</h3>
          <p className="text-xs text-[#78847D] leading-relaxed">
            Try adjusting your search terms or location. If you recently found an item, report it to help someone in need!
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

