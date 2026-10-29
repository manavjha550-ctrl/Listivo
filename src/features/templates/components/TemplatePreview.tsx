import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ListingTemplate } from '../types/template';

interface TemplatePreviewProps {
  template: Partial<ListingTemplate>;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  const primaryImg =
    template.images && template.images.length > 0
      ? template.images[template.primaryImageIndex || 0] || template.images[0]
      : null;

  const mrp = Number(template.mrp) || 999;
  const price = Number(template.defaultPrice) || 499;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4 sticky top-6">
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
        <h3 className="text-sm font-semibold text-[#101828]">Live Template Preview</h3>
        <span className="text-xs font-semibold text-[#0F766E] capitalize">
          {template.marketplace || 'Meesho'}
        </span>
      </div>

      {/* Product Header */}
      <div className="flex items-start gap-3">
        {primaryImg ? (
          <img
            src={primaryImg}
            alt="Primary Preview"
            className="w-14 h-14 rounded-lg object-cover border border-[#E4E7EC] shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex flex-col items-center justify-center shrink-0 text-[#667085]">
            <ImageIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">No image</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#667085] truncate">
            {template.brand || 'Unbranded'} · {template.category || 'Category'}
          </div>
          <h4 className="text-sm font-semibold text-[#101828] line-clamp-2 mt-0.5">
            {template.name || 'Untitled Listing Template'}
          </h4>
          {template.subCategory && (
            <span className="text-xs text-[#667085] mt-0.5 block">
              {template.subCategory}
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Tax Summary */}
      <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-base font-bold text-[#101828]">₹{price}</span>
            <span className="text-xs text-[#667085] line-through">₹{mrp}</span>
            {discount > 0 && (
              <span className="text-xs font-semibold text-[#0F766E]">{discount}% off</span>
            )}
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#667085] mt-0.5 block">
            GST {template.gstRate ?? 5}% · HSN {template.hsnCode || '6204'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#667085] block">Weight</span>
          <span className="text-xs font-mono tabular-nums font-semibold text-[#101828]">
            {template.weightGrams || 250} g
          </span>
        </div>
      </div>

      {/* Dynamic Attributes */}
      <div className="pt-3 border-t border-[#E4E7EC] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#101828]">Configured Attributes</span>
          <span className="font-mono tabular-nums text-[#667085]">
            {template.attributes?.length || 0}
          </span>
        </div>

        {template.attributes && template.attributes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {template.attributes.map((attr, i) => (
              <div key={i} className="bg-[#F8FAFC] px-2.5 py-2 rounded-lg border border-[#E4E7EC]">
                <span className="text-[#667085] block text-[11px] truncate">{attr.label}</span>
                <span className="font-medium text-[#101828] truncate block mt-0.5">
                  {String(attr.value || '—')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#667085]">No dynamic attributes configured yet.</p>
        )}
      </div>

      {/* Variants */}
      <div className="pt-3 border-t border-[#E4E7EC] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#101828]">Variant Dimensions</span>
          <span className="font-mono tabular-nums text-[#667085]">
            {template.variantDimensions?.length || 0}
          </span>
        </div>
        {template.variantDimensions && template.variantDimensions.length > 0 ? (
          <div className="text-xs text-[#667085] space-y-1">
            {template.variantDimensions.map((v, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="font-medium text-[#101828]">{v.name}</span>
                <span className="font-mono tabular-nums">{v.options.length} options</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#667085]">Single product template (1 SKU).</p>
        )}
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-[#E4E7EC] text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[#667085]">Return Policy</span>
          <span className="font-medium text-[#101828]">
            {template.returnPolicy || '7 Days Easy Return'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#667085]">SKU Prefix</span>
          <span className="font-mono font-semibold text-[#101828]">
            {template.skuPrefix || 'SKU-TPL'}
          </span>
        </div>
      </div>
    </div>
  );
};
