import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Store, Layers } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { KeywordResearchInput } from '../types/keywordTypes';

interface KeywordResearchFormProps {
  onSubmit: (input: KeywordResearchInput) => void;
  isLoading: boolean;
}

export const KeywordResearchForm: React.FC<KeywordResearchFormProps> = ({ onSubmit, isLoading }) => {
  const [productName, setProductName] = useState('Women Rayon Printed Straight Kurti');
  const [category, setCategory] = useState('Women Ethnic Wear');
  const [description, setDescription] = useState(
    'Comfortable daily wear rayon kurti with breathable fabric and traditional foil print.'
  );
  const [material, setMaterial] = useState('100% Pure Rayon');
  const [color, setColor] = useState('Maroon Red');
  const [size] = useState('S, M, L, XL, XXL');
  const [targetCustomer, setTargetCustomer] = useState('Women & Girls');
  const [marketplace, setMarketplace] = useState('meesho');
  const [language, setLanguage] = useState('English');
  const [customInstructions] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    onSubmit({
      productName,
      category,
      description,
      material,
      color,
      size,
      targetCustomer,
      marketplace,
      language,
      customInstructions,
    });
  };

  return (
    <Card padding="md" className="border-[#E4E7EC] bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E7EC] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 border border-[#14B8A6]/25 text-[#0F766E] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#101828]">01. Product Search Parameters</h2>
              <p className="text-xs text-[#667085]">
                Extract high-intent buyer search terms calibrated for Indian marketplace indexing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-[#475467] hover:text-[#101828] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-[#F8FAFC] hover:bg-white transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#667085]" />
            <span>{showAdvanced ? 'Hide Optional Attributes' : 'Optional Attributes'}</span>
          </button>
        </div>

        {/* Primary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cotton Printed Kurti Set"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Women Ethnic Wear"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] transition-colors"
              />
              <Layers className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
              Target Marketplace
            </label>
            <div className="relative">
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] cursor-pointer"
              >
                <option value="meesho">Meesho</option>
                <option value="flipkart">Flipkart</option>
                <option value="amazon">Amazon India</option>
                <option value="myntra">Myntra</option>
              </select>
              <Store className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#667085]" />
            </div>
          </div>
        </div>

        {/* Optional Secondary Inputs */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-3 border-t border-[#E4E7EC]">
            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
                Material / Fabric
              </label>
              <input
                type="text"
                placeholder="e.g. 100% Rayon"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
                Color & Pattern
              </label>
              <input
                type="text"
                placeholder="e.g. Maroon Red, Printed"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
                Target Buyer
              </label>
              <input
                type="text"
                placeholder="e.g. Women, Girls, Festive"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
                Search Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              >
                <option value="English">English (Standard)</option>
                <option value="Hinglish">Hinglish (Vernacular Search)</option>
                <option value="Hindi">Hindi Script</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
                Product Context Notes
              </label>
              <textarea
                rows={2}
                placeholder="Describe sleeve pattern, neckline, occasion, or differentiators..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-[#667085]">
            Generates primary, long-tail, attribute, and seasonal search phrases.
          </p>
          <Button
            type="submit"
            variant="teal"
            size="sm"
            isLoading={isLoading}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Discover Search Keywords
          </Button>
        </div>
      </form>
    </Card>
  );
};
