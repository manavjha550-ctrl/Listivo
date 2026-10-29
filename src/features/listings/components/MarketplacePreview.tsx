import React from 'react';
import { Truck, RotateCcw, Heart, Share2, ShoppingBag, Package } from 'lucide-react';
import { ListingImage } from '../types/listing';

interface MarketplacePreviewProps {
  title: string;
  brand: string;
  category: string;
  marketplace: string;
  sellingPrice: number;
  mrp: number;
  discountPercent: number;
  images: ListingImage[];
  description: string;
  keyFeatures: string[];
  hasVariants: boolean;
  variantsCount: number;
  returnPolicy: string;
}

export const MarketplacePreview: React.FC<MarketplacePreviewProps> = ({
  title,
  brand,
  marketplace,
  sellingPrice,
  mrp,
  discountPercent,
  images,
  description,
  hasVariants,
  variantsCount,
  returnPolicy,
}) => {
  const primaryImg = images?.find((i) => i.isPrimary)?.url || images?.[0]?.url;

  return (
    <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E4E7EC] space-y-4">
      <div className="flex items-center justify-between text-xs text-[#667085]">
        <span className="font-medium text-[#101828]">Buyer Storefront Preview</span>
        <span className="font-semibold text-[#0F766E] capitalize">{marketplace}</span>
      </div>

      {/* Storefront Preview Card */}
      <div className="max-w-sm mx-auto bg-white rounded-2xl border border-[#E4E7EC] shadow-sm overflow-hidden text-xs text-[#101828]">
        {/* Top Bar */}
        <div className="bg-[#101828] text-white px-4 py-3 flex items-center justify-between font-semibold">
          <span className="text-xs capitalize tracking-wide">{marketplace} Storefront</span>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Share2 className="w-3.5 h-3.5" />
            <Heart className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Product Image */}
        <div className="aspect-square bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center">
          {primaryImg ? (
            <img
              src={primaryImg}
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#667085]">
              <Package className="w-6 h-6" />
              <span className="text-xs">No primary image</span>
            </div>
          )}
          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#101828]/80 text-white font-mono tabular-nums text-[10px] font-semibold">
            1 / {Math.max(1, images.length)}
          </span>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div>
            <span className="text-[11px] font-medium text-[#667085] block">
              {brand || 'Brand Name'}
            </span>
            <h3 className="font-semibold text-[#101828] text-sm line-clamp-2 leading-snug mt-0.5">
              {title || 'Untitled Product Listing'}
            </h3>
          </div>

          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-lg font-bold text-[#101828]">₹{sellingPrice || 0}</span>
            {mrp > sellingPrice && (
              <span className="text-[#667085] line-through text-xs">₹{mrp}</span>
            )}
            {discountPercent > 0 && (
              <span className="text-[#0F766E] font-semibold text-xs">
                {discountPercent}% off
              </span>
            )}
          </div>

          {hasVariants && (
            <div className="pt-2.5 border-t border-[#E4E7EC]">
              <span className="text-[11px] font-medium text-[#667085] block mb-1.5">
                Available Options ({variantsCount} variants)
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {['S', 'M', 'L', 'XL'].map((sz) => (
                  <span
                    key={sz}
                    className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E4E7EC] text-[11px] font-mono font-medium"
                  >
                    {sz}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2.5 border-t border-[#E4E7EC] grid grid-cols-2 gap-2 text-[11px] text-[#667085]">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Standard Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span className="truncate">{returnPolicy || '7 Days Return'}</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#E4E7EC] text-xs">
            <span className="font-semibold text-[#101828] block mb-1">Product Details</span>
            <p className="line-clamp-3 text-[#667085] leading-relaxed">
              {description || 'Your product description will appear here once entered.'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] border-t border-[#E4E7EC]">
          <div className="w-full py-2 bg-[#14B8A6] text-white font-semibold rounded-lg text-center text-xs flex items-center justify-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Buyer CTA Preview
          </div>
        </div>
      </div>
    </div>
  );
};
