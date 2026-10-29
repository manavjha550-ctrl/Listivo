import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, Edit2, Trash2, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import { ProductListing } from '../types/listing';

interface ListingTableRowProps {
  listing: ProductListing;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMarkReady: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export const ListingTableRow: React.FC<ListingTableRowProps> = ({
  listing,
  isSelected,
  onToggleSelect,
  onDuplicate,
  onMarkReady,
  onDeleteClick,
}) => {
  const primaryImg = listing.images?.find((i) => i.isPrimary)?.url || listing.images?.[0]?.url;

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
        return <span className="text-xs text-[#667085]">{listing.status}</span>;
    }
  };

  const formatMarketplace = (mpRaw: string) => {
    const mp = (mpRaw || 'meesho').toLowerCase();
    if (mp === 'meesho') return 'Meesho';
    if (mp === 'flipkart') return 'Flipkart';
    if (mp === 'amazon') return 'Amazon India';
    if (mp === 'myntra') return 'Myntra';
    return mpRaw;
  };

  return (
    <tr
      className={`hover:bg-[#F8FAFC] transition-colors ${
        isSelected ? 'bg-[#14B8A6]/5' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="py-3 px-4 w-10">
        <input
          type="checkbox"
          aria-label={`Select ${listing.title}`}
          checked={isSelected}
          onChange={() => onToggleSelect(listing.id)}
          className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
        />
      </td>

      {/* Product & SKU */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] overflow-hidden shrink-0 flex items-center justify-center">
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

          <div className="min-w-0">
            <Link
              to={`/listings/${listing.id}`}
              className="font-semibold text-[#101828] hover:text-[#0F766E] transition-colors line-clamp-1 text-xs"
            >
              {listing.title}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#667085]">
              <span className="font-mono font-medium text-[#101828]">{listing.sku}</span>
              {listing.brand && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">{listing.brand}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Platform & Category */}
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="font-medium text-[#101828] text-xs">
          {formatMarketplace(listing.marketplace)}
        </div>
        <div className="text-[11px] text-[#667085] truncate max-w-[140px]">
          {listing.category}
        </div>
      </td>

      {/* Price & MRP */}
      <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums">
        <div className="font-semibold text-[#101828] text-xs">
          ₹{listing.sellingPrice?.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-[#667085]">
          <span className="line-through">₹{listing.mrp?.toLocaleString('en-IN')}</span>
          {listing.discountPercent ? (
            <span className="text-[#0F766E] ml-1">-{listing.discountPercent}%</span>
          ) : null}
        </div>
      </td>

      {/* Variants */}
      <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums text-xs text-[#101828]">
        {listing.variantsCount || 1}
      </td>

      {/* Status */}
      <td className="py-3 px-4 whitespace-nowrap">{renderStatus()}</td>

      {/* Validation */}
      <td className="py-3 px-4 whitespace-nowrap">
        {listing.validationResults ? (
          listing.validationResults.errorCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 font-mono tabular-nums">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              {listing.validationResults.errorCount} issue
              {listing.validationResults.errorCount === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0F766E]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
              Valid
            </span>
          )
        ) : (
          <span className="text-xs text-[#667085]">Unchecked</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1">
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
            title="Duplicate Listing"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {listing.status !== 'READY' && (
            <button
              type="button"
              onClick={() => onMarkReady(listing.id)}
              className="p-1.5 rounded-md text-[#667085] hover:text-[#0F766E] hover:bg-[#14B8A6]/10 transition-colors cursor-pointer"
              title="Mark as Ready"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteClick(listing.id)}
            className="p-1.5 rounded-md text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Listing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
