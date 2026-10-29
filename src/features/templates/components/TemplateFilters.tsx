import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { TemplateFilterParams } from '../types/template';

interface TemplateFiltersProps {
  params: TemplateFilterParams;
  onFilterChange: (newParams: Partial<TemplateFilterParams>) => void;
  totalCount: number;
  filteredCount: number;
}

const PLATFORM_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'meesho', label: 'Meesho' },
  { key: 'flipkart', label: 'Flipkart' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'myntra', label: 'Myntra' },
];

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  params,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const activePlatform = params.platform || 'ALL';

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Segmented Marketplace Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg self-start">
          {PLATFORM_TABS.map((tab) => {
            const isActive = activePlatform === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange({ platform: tab.key })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-2xs'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search + Category + Sort */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
            <input
              type="text"
              value={params.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search templates or SKU prefix..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] focus:bg-white text-[#101828] transition-colors"
            />
          </div>

          <select
            value={params.category || 'ALL'}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            aria-label="Filter by category"
            className="text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg px-3 py-1.5 font-medium text-[#101828] focus:outline-none focus:border-[#14B8A6] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Apparel">Apparel</option>
            <option value="Footwear">Footwear</option>
            <option value="Jewelry & Accessories">Jewelry &amp; Accessories</option>
            <option value="Home & Kitchen">Home &amp; Kitchen</option>
            <option value="Beauty">Beauty</option>
          </select>

          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E4E7EC] px-2.5 py-1.5 rounded-lg text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#667085]" />
            <select
              value={params.sort || 'updated'}
              onChange={(e) => onFilterChange({ sort: e.target.value as any })}
              aria-label="Sort templates"
              className="bg-transparent font-medium text-[#101828] focus:outline-none cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A–Z)</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Counter summary */}
      <div className="pt-2.5 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
        <span>
          Showing{' '}
          <strong className="font-mono tabular-nums font-semibold text-[#101828]">
            {filteredCount}
          </strong>{' '}
          of{' '}
          <strong className="font-mono tabular-nums font-semibold text-[#101828]">
            {totalCount}
          </strong>{' '}
          templates
        </span>
        {(params.search ||
          (params.category && params.category !== 'ALL') ||
          (params.platform && params.platform !== 'ALL')) && (
          <button
            type="button"
            onClick={() =>
              onFilterChange({ search: '', category: 'ALL', platform: 'ALL', sort: 'updated' })
            }
            className="text-xs font-medium text-[#0F766E] hover:underline cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
