import React from 'react';
import { Truck } from 'lucide-react';

interface PricingSectionProps {
  sellingPrice: number;
  setSellingPrice: (val: number) => void;
  mrp: number;
  setMrp: (val: number) => void;
  costPrice: number;
  setCostPrice: (val: number) => void;
  marginPercent: number;
  profitAmount: number;
  stock: number;
  setStock: (val: number) => void;
  gstRate: number;
  setGstRate: (val: number) => void;
  hsnCode: string;
  setHsnCode: (val: string) => void;
  weightGrams: number;
  setWeightGrams: (val: number) => void;
  lengthCm: number;
  setLengthCm: (val: number) => void;
  widthCm: number;
  setWidthCm: (val: number) => void;
  heightCm: number;
  setHeightCm: (val: number) => void;
  returnPolicy: string;
  setReturnPolicy: (val: string) => void;
  careInstructions: string;
  setCareInstructions: (val: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  sellingPrice,
  setSellingPrice,
  mrp,
  setMrp,
  costPrice,
  setCostPrice,
  marginPercent,
  profitAmount,
  stock,
  setStock,
  gstRate,
  setGstRate,
  hsnCode,
  setHsnCode,
  weightGrams,
  setWeightGrams,
  lengthCm,
  setLengthCm,
  widthCm,
  setWidthCm,
  heightCm,
  setHeightCm,
  returnPolicy,
  setReturnPolicy,
  careInstructions,
  setCareInstructions,
}) => {
  const inputBase =
    'w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] text-[#101828] font-mono tabular-nums transition-colors';

  return (
    <div className="space-y-6">
      {/* Profitability Summary Strip */}
      <div className="bg-[#101828] text-white rounded-xl p-5 flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs text-slate-400 block">Estimated Seller Unit Economics</span>
          <div className="flex flex-wrap items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums">
              ₹{profitAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-300">Net Profit / Unit</span>
            <span className="px-2 py-0.5 rounded-md bg-[#14B8A6]/20 border border-[#14B8A6]/40 text-[#14B8A6] font-mono tabular-nums font-semibold text-xs">
              {marginPercent.toFixed(1)}% Margin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 block">Selling Price</span>
            <span className="font-mono tabular-nums font-semibold text-sm text-white">
              ₹{sellingPrice}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">COGS / Unit</span>
            <span className="font-mono tabular-nums font-semibold text-sm text-white">
              ₹{costPrice}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Discount off MRP</span>
            <span className="font-mono tabular-nums font-semibold text-sm text-[#14B8A6]">
              {mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Selling Price (₹) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              placeholder="499"
              className={`${inputBase} pl-7 font-semibold text-[#0F766E]`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            MRP (Maximum Retail Price ₹) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              value={mrp}
              onChange={(e) => setMrp(Number(e.target.value))}
              placeholder="999"
              className={`${inputBase} pl-7`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Cost Price / COGS (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              placeholder="220"
              className={`${inputBase} pl-7`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Inventory Stock Units
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="50"
            className={inputBase}
          />
        </div>
      </div>

      {/* GST & HSN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E4E7EC]">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            GST Tax Slab (%) <span className="text-rose-600">*</span>
          </label>
          <select
            value={gstRate}
            onChange={(e) => setGstRate(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:border-[#14B8A6] text-[#101828] font-medium cursor-pointer"
          >
            <option value={0}>0% (Exempt)</option>
            <option value={3}>3% (Gold &amp; Precious Metal)</option>
            <option value={5}>5% (Apparel under ₹1000 &amp; Footwear)</option>
            <option value={12}>12% (Apparel above ₹1000)</option>
            <option value={18}>18% (Standard Electronics &amp; Accessories)</option>
            <option value={28}>28% (Luxury Goods)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            HSN Code <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={hsnCode}
            onChange={(e) => setHsnCode(e.target.value)}
            placeholder="e.g. 6204 (Apparel), 7117 (Jewelry)"
            className={`${inputBase} font-semibold`}
          />
        </div>
      </div>

      {/* Package Weight & Dimensions */}
      <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
        <h4 className="font-semibold text-[#101828] text-xs flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#14B8A6]" /> Package Shipping &amp; Volumetric Specifications
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#667085] mb-1">
              Weight (Grams)
            </label>
            <input
              type="number"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
              placeholder="250"
              className={inputBase}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#667085] mb-1">
              Length (cm)
            </label>
            <input
              type="number"
              value={lengthCm}
              onChange={(e) => setLengthCm(Number(e.target.value))}
              placeholder="25"
              className={inputBase}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#667085] mb-1">
              Width (cm)
            </label>
            <input
              type="number"
              value={widthCm}
              onChange={(e) => setWidthCm(Number(e.target.value))}
              placeholder="18"
              className={inputBase}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#667085] mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              placeholder="4"
              className={inputBase}
            />
          </div>
        </div>
      </div>

      {/* Return Policy & Care Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E4E7EC]">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Return Policy Statement
          </label>
          <input
            type="text"
            value={returnPolicy}
            onChange={(e) => setReturnPolicy(e.target.value)}
            placeholder="e.g. 7 Days Easy Return & Replacement"
            className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:border-[#14B8A6] text-[#101828]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Wash &amp; Care Instructions
          </label>
          <input
            type="text"
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
            placeholder="e.g. Hand wash in cold water, do not bleach"
            className="w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:border-[#14B8A6] text-[#101828]"
          />
        </div>
      </div>
    </div>
  );
};
