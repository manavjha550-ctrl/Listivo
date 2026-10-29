import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, Edit2, Trash2, CheckCircle2, Package } from 'lucide-react';
import { ProductListing } from '../types/listing';

interface ListingCardProps {
  listing: ProductListing;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkReady: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSelected,
  onToggleSelect,
  onDuplicate,
  onMarkReady,
  onDeleteClick,
}) => {
  const primaryImg = listing.images?.find((i) => i.isPrimary)?.url || listing.images?.[0]?.url;

  const formatMarketplace = (mpRaw: string) => {
    const mp = (mpRaw || 'meesho').toLowerCase();
    if (mp === 'meesho') return 'Meesho';
    if (mp === 'flipkart') return 'Flipkart';
    if (mp === 'amazon') return 'Amazon India';
    if (mp === 'myntra') return 'Myntra';
    return mpRaw;
  };

  const renderStatus = () => {
    switch (listing.status) {
      case 'READY':
        return <span className="text-xs font-semibold text-[#0F766E]">Ready</span>;
      case 'DRAFT':
        return <span className="text-xs font-medium text-[#667085]">Draft</span>;
      case 'INCOMPLETE':
        return <span className="text-xs font-semibold text-amber-700">Incomplete</span>;
      case 'EXPORTED':
        return <span className="text-xs font-semibold text-[#2563EB]">Exported</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 transition-colors flex flex-col justify-between ${
        isSelected
          ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20 bg-[#14B8A6]/5'
          : 'border-[#E4E7EC] hover:border-[#14B8A6]'
      }`}
    >
      <div>
        {/* Top Row */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 text-[#667085]">
            <input
              type="checkbox"
              aria-label={`Select ${listing.title}`}
              checked={isSelected}
              onChange={() => onToggleSelect(listing.id)}
              className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
            />
            <span className="font-semibold text-[#101828]">
              {formatMarketplace(listing.marketplace)}
            </span>
          </div>
          {renderStatus()}
        </div>

        {/* Thumbnail & Product Title */}
        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] overflow-hidden shrink-0 flex items-center justify-center">
            {primaryImg ? (
              <img
                src={primaryImg}
                alt={listing.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Package className="w-4 h-4 text-[#667085]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/listings/${listing.id}`}
              className="font-semibold text-[#101828] hover:text-[#0F766E] transition-colors text-xs line-clamp-2 block"
            >
              {listing.title}
            </Link>
            <div className="font-mono text-[11px] text-[#667085] mt-0.5 truncate">
              {listing.sku}
            </div>
            <div className="text-[11px] text-[#667085] truncate">{listing.category}</div>
          </div>
        </div>

        {/* Clean Hairline Pricing Row */}
        <div className="mt-3.5 pt-3 border-t border-[#E4E7EC] flex items-baseline justify-between font-mono tabular-nums">
          <div>
            <span className="text-[11px] font-sans text-[#667085] block">Selling Price</span>
            <span className="font-bold text-[#101828] text-sm">
              ₹{listing.sellingPrice?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right text-xs text-[#667085]">
            <span className="line-through">₹{listing.mrp}</span>
            {listing.discountPercent ? (
              <span className="text-[#0F766E] font-semibold ml-1">
                -{listing.discountPercent}%
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3.5 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs">
        <span className="font-mono tabular-nums text-[11px] text-[#667085]">
          {listing.variantsCount || 1} variant{(listing.variantsCount || 1) === 1 ? '' : 's'}
        </span>

        <div className="flex items-center gap-1">
          <Link
            to={`/listings/${listing.id}`}
            className="p-1.5 rounded-md text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] transition-colors"
            title="Edit Listing"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onDuplicate(listing.id)}
            className="p-1.5 rounded-md text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {listing.status !== 'READY' && (
            <button
              type="button"
              onClick={() => onMarkReady(listing.id)}
              className="p-1.5 rounded-md text-[#667085] hover:text-[#0F766E] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
              title="Mark Ready"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDeleteClick(listing.id)}
            className="p-1.5 rounded-md text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
