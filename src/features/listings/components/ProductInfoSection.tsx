import React from 'react';
import { Sparkles, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ProductInfoSectionProps {
  title: string;
  setTitle: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  styleId: string;
  setStyleId: (val: string) => void;
  marketplace: string;
  setMarketplace: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  subCategory: string;
  setSubCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  material: string;
  setMaterial: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  keyFeatures: string[];
  setKeyFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  generateSku: () => void;
  onOpenAIModal: () => void;
}

export const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  title,
  setTitle,
  sku,
  setSku,
  styleId,
  setStyleId,
  marketplace,
  setMarketplace,
  category,
  setCategory,
  subCategory,
  setSubCategory,
  brand,
  setBrand,
  material,
  setMaterial,
  description,
  setDescription,
  keyFeatures,
  setKeyFeatures,
  generateSku,
  onOpenAIModal,
}) => {
  const handleFeatureChange = (index: number, value: string) => {
    setKeyFeatures((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddFeature = () => {
    setKeyFeatures((prev) => [...prev, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setKeyFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const inputBase =
    'w-full px-3.5 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] text-[#101828] transition-colors';

  return (
    <div className="space-y-6">
      {/* Classification Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Target Marketplace <span className="text-rose-600">*</span>
          </label>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className={`${inputBase} font-medium cursor-pointer`}
          >
            <option value="meesho">Meesho</option>
            <option value="flipkart">Flipkart</option>
            <option value="amazon">Amazon India</option>
            <option value="myntra">Myntra</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Category <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Apparel & Fashion, Jewelry..."
            className={inputBase}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">Sub-Category</label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="e.g. Kurtis, Sneakers..."
            className={inputBase}
          />
        </div>
      </div>

      {/* Identifiers Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Brand Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. TrendApparel, UrbanStep..."
            className={`${inputBase} font-medium`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#101828]">
              Product SKU Code <span className="text-rose-600">*</span>
            </label>
            <button
              type="button"
              onClick={generateSku}
              className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Auto-Gen
            </button>
          </div>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. KURTI-RAYON-YLW-001"
            className={`${inputBase} font-mono font-semibold`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Style / Catalog ID
          </label>
          <input
            type="text"
            value={styleId}
            onChange={(e) => setStyleId(e.target.value)}
            placeholder="e.g. STYLE-KURTI-101"
            className={`${inputBase} font-mono`}
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-[#101828] mb-1.5">
          Product Listing Title <span className="text-rose-600">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Women Printed Rayon Straight Kurti (Mustard Yellow)"
          className={`${inputBase} py-2.5 text-sm font-medium`}
        />
        <p className="text-xs text-[#667085] mt-1.5 flex items-center justify-between gap-2">
          <span>Include Brand + Category + Material + Color + Key Attribute for search indexing.</span>
          <span
            className={`font-mono tabular-nums shrink-0 ${
              title.length >= 10 ? 'text-[#0F766E] font-semibold' : 'text-amber-600'
            }`}
          >
            {title.length} chars
          </span>
        </p>
      </div>

      {/* Material */}
      <div>
        <label className="block text-xs font-medium text-[#101828] mb-1.5">
          Primary Fabric / Material
        </label>
        <input
          type="text"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="e.g. 100% Pure Rayon, Genuine Leather..."
          className={inputBase}
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-[#101828]">
            Product Description <span className="text-rose-600">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onOpenAIModal}
            icon={<Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />}
          >
            Smart Listing Helper
          </Button>
        </div>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a clear, accurate product description..."
          className={`${inputBase} p-3 text-sm leading-relaxed`}
        />
      </div>

      {/* Key Features */}
      <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#101828] text-xs">Key Feature Bullet Points</h4>
            <p className="text-xs text-[#667085]">
              Highlighted on marketplace product detail pages.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddFeature}
            className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Bullet
          </button>
        </div>

        <div className="space-y-2">
          {keyFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-[#667085] font-mono tabular-nums w-5">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={feat}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                placeholder={`Key feature ${idx + 1}...`}
                className="flex-1 px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:border-[#14B8A6] text-[#101828]"
              />
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                aria-label="Remove bullet"
                className="p-1.5 text-[#667085] hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
