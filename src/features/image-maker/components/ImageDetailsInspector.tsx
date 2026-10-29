import React from 'react';
import { ImageSlotItem, MARKETPLACE_CONFIGURED_RULES } from '../types/imageWorkspace';
import { CheckCircle2, ShieldCheck, Ruler, Info } from 'lucide-react';
import { STUDIO_FALLBACK_DATA_URI } from '../utils/studioSamples';

interface ImageDetailsInspectorProps {
  selectedSlot: ImageSlotItem | null;
  targetMarketplace: string;
  onTargetMarketplaceChange: (mp: string) => void;
}

export const ImageDetailsInspector: React.FC<ImageDetailsInspectorProps> = ({
  selectedSlot,
  targetMarketplace,
  onTargetMarketplaceChange,
}) => {
  const rule = MARKETPLACE_CONFIGURED_RULES[targetMarketplace] || MARKETPLACE_CONFIGURED_RULES['meesho'];

  const getProtocolLabel = (url: string) => {
    if (url.startsWith('data:image/')) return 'Local Data Asset';
    if (url.startsWith('https://')) return 'HTTPS (Secure)';
    if (url.startsWith('http://')) return 'HTTP';
    return 'Local Path';
  };

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 space-y-5">
      {/* Target Marketplace Selector */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#475467] block mb-1.5">
          Marketplace Compliance Profile
        </label>
        <select
          value={targetMarketplace}
          onChange={(e) => onTargetMarketplaceChange(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828] font-medium"
        >
          <option value="meesho">Meesho (Min 500×500, Max 6)</option>
          <option value="flipkart">Flipkart (Min 800×800, Max 8)</option>
          <option value="amazon">Amazon IN (Min 1000×1000, Max 9)</option>
          <option value="myntra">Myntra (Min 1080×1440, 3:4)</option>
        </select>
      </div>

      {/* Selected Slot Inspector */}
      {selectedSlot ? (
        <div className="space-y-4 border-t border-[#E4E7EC] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#101828]">
              Slot <span className="font-mono tabular-nums">#{selectedSlot.position}</span> Inspector
            </span>
            {selectedSlot.isPrimary && (
              <span className="text-[11px] font-semibold text-[#0F766E]">Primary Cover</span>
            )}
          </div>

          <div className="aspect-square bg-[#F8FAFC] rounded-xl overflow-hidden border border-[#E4E7EC] relative">
            <img
              src={selectedSlot.url}
              alt={`Slot ${selectedSlot.position} preview`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const imgEl = e.currentTarget;
                if (imgEl.src !== STUDIO_FALLBACK_DATA_URI) {
                  imgEl.src = STUDIO_FALLBACK_DATA_URI;
                }
              }}
            />
          </div>

          {/* Validation Status Box */}
          <div className="p-3 rounded-lg border border-[#E4E7EC] space-y-1.5 text-xs bg-[#F8FAFC]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#475467]">Compliance Status</span>
              <span
                className={`font-semibold text-[11px] uppercase tracking-wide ${
                  selectedSlot.validationStatus === 'VALID'
                    ? 'text-[#0F766E]'
                    : selectedSlot.validationStatus === 'WARNING'
                    ? 'text-amber-700'
                    : selectedSlot.validationStatus === 'ERROR'
                    ? 'text-rose-700'
                    : 'text-[#667085]'
                }`}
              >
                {selectedSlot.validationStatus}
              </span>
            </div>
            {selectedSlot.validationMessage && (
              <p className="text-[11px] text-[#667085] leading-relaxed">{selectedSlot.validationMessage}</p>
            )}
          </div>

          {/* Properties Grid */}
          <div className="space-y-2 text-xs text-[#667085]">
            <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-[#98A2B3]" /> Resolution
              </span>
              <span className="font-mono font-semibold tabular-nums text-[#101828]">
                {selectedSlot.width && selectedSlot.height
                  ? `${selectedSlot.width} × ${selectedSlot.height} px`
                  : 'Inspecting...'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
              <span>Aspect Ratio</span>
              <span className="font-mono font-semibold tabular-nums text-[#101828]">
                {selectedSlot.aspectRatio || '1:1'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
              <span>Source Type</span>
              <span className="font-mono font-medium text-[11px] text-[#101828]">
                {getProtocolLabel(selectedSlot.url)}
              </span>
            </div>
          </div>

          {/* Configured Requirement Rule Checks */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg space-y-2 text-xs">
            <span className="font-semibold text-[#101828] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>{rule.marketplaceName} Image Spec</span>
            </span>
            <ul className="space-y-1 text-[11px] text-[#475467]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#0F766E] shrink-0" />
                <span>
                  Min Resolution:{' '}
                  <strong className="font-mono tabular-nums text-[#101828]">
                    {rule.minWidth}×{rule.minHeight}px
                  </strong>
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#0F766E] shrink-0" />
                <span>
                  Recommended Ratio:{' '}
                  <strong className="font-mono tabular-nums text-[#101828]">{rule.recommendedAspect}</strong>
                </span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#0F766E] shrink-0" />
                <span>
                  Max Gallery Slots:{' '}
                  <strong className="font-mono tabular-nums text-[#101828]">{rule.maxSlots}</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center border border-dashed border-[#D0D5DD] rounded-xl text-[#667085]">
          <Info className="w-5 h-5 mx-auto mb-1.5 text-[#98A2B3]" />
          <p className="text-xs">Select any gallery slot to inspect dimensions and marketplace compliance.</p>
        </div>
      )}
    </div>
  );
};
