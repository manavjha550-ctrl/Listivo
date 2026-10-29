import React from 'react';
import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { ListingFilters as FiltersType } from '../types/listing';

interface ListingFiltersProps {
  filters: FiltersType;
  setFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  stats: {
    total: number;
    ready: number;
    draft: number;
    incomplete: number;
    exported: number;
  };
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  stats,
}) => {
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 space-y-3">
      {/* Top Row: Search, Category, Sort, View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search by title, SKU, brand, or category..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] text-[#101828] placeholder:text-[#667085] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            aria-label="Filter by category"
            className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg px-3 py-1.5 text-xs text-[#101828] font-medium focus:outline-none focus:border-[#14B8A6] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Apparel">Apparel &amp; Fashion</option>
            <option value="Women Ethnic Wear">Women Ethnic Wear</option>
            <option value="Jewelry & Accessories">Jewelry &amp; Accessories</option>
            <option value="Footwear">Footwear</option>
            <option value="Home & Kitchen">Home &amp; Kitchen</option>
          </select>

          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as any }))}
              aria-label="Sort listings"
              className="bg-transparent text-xs text-[#101828] font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="title_asc">Title: A–Z</option>
              <option value="variants_desc">Most Variants</option>
            </select>
          </div>

          <div
            className="flex items-center bg-[#F8FAFC] p-0.5 rounded-lg border border-[#E4E7EC]"
            role="group"
            aria-label="Listing view mode"
          >
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#101828] shadow-2xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#101828] shadow-2xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Segmented Marketplace & Status Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#E4E7EC] text-xs">
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'meesho', label: 'Meesho' },
            { id: 'flipkart', label: 'Flipkart' },
            { id: 'amazon', label: 'Amazon' },
            { id: 'myntra', label: 'Myntra' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, marketplace: item.id }))}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filters.marketplace === item.id
                  ? 'bg-[#101828] text-white'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'ready', label: 'Ready', count: stats.ready },
            { id: 'draft', label: 'Draft', count: stats.draft },
            { id: 'incomplete', label: 'Incomplete', count: stats.incomplete },
            { id: 'exported', label: 'Exported', count: stats.exported },
          ].map((st) => {
            const isActive = filters.status === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: st.id }))}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#101828] shadow-2xs border border-[#E4E7EC]'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                <span>{st.label}</span>
                <span className="ml-1 font-mono tabular-nums text-[11px] opacity-80">
                  {st.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
