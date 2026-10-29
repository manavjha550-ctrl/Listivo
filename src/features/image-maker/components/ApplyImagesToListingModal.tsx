import React, { useState } from 'react';
import { X, Layers, Check, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ImageSlotItem } from '../types/imageWorkspace';
import { Button } from '../../../components/ui/Button';

interface ProductOption {
  id: string;
  title: string;
  sku: string;
  marketplace: string;
  imagesCount: number;
  variants?: Array<{ id: string; sku: string; attributes: Record<string, string> }>;
}

interface ApplyImagesToListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: ImageSlotItem[];
  availableListings: ProductOption[];
  onSuccessApply: (updatedListingIds: string[]) => void;
}

export const ApplyImagesToListingModal: React.FC<ApplyImagesToListingModalProps> = ({
  isOpen,
  onClose,
  slots,
  availableListings,
  onSuccessApply,
}) => {
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [applyMode, setApplyMode] = useState<'overwrite' | 'append'>('overwrite');
  const [targetVariantId] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);
  const [resultSummary, setResultSummary] = useState<{ updatedCount: number; failedCount: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelectListing = (id: string) => {
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedListingIds(availableListings.map((l) => l.id));
  };

  const deselectAll = () => {
    setSelectedListingIds([]);
  };

  const handleApply = async () => {
    if (selectedListingIds.length === 0) {
      setErrorMsg('Select at least one catalog listing.');
      return;
    }

    setIsApplying(true);
    setErrorMsg(null);

    const formattedImages = slots.map((s, idx) => ({
      id: s.id,
      url: s.url,
      altText: s.title || `Product Image ${idx + 1}`,
      isPrimary: s.isPrimary,
    }));

    try {
      const response = await fetch('/api/images/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingIds: selectedListingIds,
          images: formattedImages,
          mode: applyMode,
          variantIds: targetVariantId ? [targetVariantId] : undefined,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to apply images to listings.');
      }

      setResultSummary({
        updatedCount: data.updatedCount,
        failedCount: data.failedCount,
      });

      onSuccessApply(data.updatedListingIds || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/55 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-[#E4E7EC] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#101828] text-white flex items-center justify-between border-b border-[#1D2939]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#14B8A6]/15 border border-[#14B8A6]/30 rounded-lg text-[#14B8A6] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Assign Gallery to Listings</h3>
              <p className="text-xs text-[#98A2B3]">
                Attach <span className="font-mono tabular-nums">{slots.length}</span> ordered image slots to catalog SKUs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#98A2B3] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resultSummary ? (
            <div className="p-6 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl text-center space-y-3">
              <div className="w-10 h-10 bg-[#14B8A6] text-[#101828] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-[#101828] text-sm">Gallery Assigned</h4>
              <p className="text-xs text-[#475467]">
                Updated{' '}
                <strong className="font-mono tabular-nums text-[#101828]">{resultSummary.updatedCount}</strong>{' '}
                listing(s).
                {resultSummary.failedCount > 0 && ` (${resultSummary.failedCount} failed)`}
              </p>
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selection Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] px-3.5 py-2.5 rounded-lg border border-[#E4E7EC]">
                <div className="text-xs text-[#475467]">
                  <strong className="font-mono tabular-nums text-[#101828]">{selectedListingIds.length}</strong> of{' '}
                  <span className="font-mono tabular-nums">{availableListings.length}</span> listings selected
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-semibold text-[#0F766E] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#D0D5DD]" aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="font-medium text-[#667085] hover:text-[#101828]"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Apply Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setApplyMode('overwrite')}
                  className={`p-3 rounded-lg border text-xs text-left transition-colors ${
                    applyMode === 'overwrite'
                      ? 'bg-[#14B8A6]/10 border-[#14B8A6] text-[#101828]'
                      : 'bg-white border-[#E4E7EC] text-[#475467] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-semibold text-[#101828] mb-0.5">Replace Gallery</div>
                  <div className="text-[11px] text-[#667085]">
                    Replaces existing images with these {slots.length} slots.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setApplyMode('append')}
                  className={`p-3 rounded-lg border text-xs text-left transition-colors ${
                    applyMode === 'append'
                      ? 'bg-[#14B8A6]/10 border-[#14B8A6] text-[#101828]'
                      : 'bg-white border-[#E4E7EC] text-[#475467] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-semibold text-[#101828] mb-0.5">Append Slots</div>
                  <div className="text-[11px] text-[#667085]">
                    Appends these {slots.length} slots after existing photos.
                  </div>
                </button>
              </div>

              {/* Listings List Checklist */}
              <div className="border border-[#E4E7EC] rounded-lg divide-y divide-[#E4E7EC] max-h-56 overflow-y-auto">
                {availableListings.length === 0 ? (
                  <p className="p-6 text-center text-xs text-[#667085]">No listings found in your catalog.</p>
                ) : (
                  availableListings.map((listing) => {
                    const isChecked = selectedListingIds.includes(listing.id);
                    return (
                      <label
                        key={listing.id}
                        className={`p-3 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#14B8A6]/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectListing(listing.id)}
                            className="w-4 h-4 accent-[#101828] rounded border-[#D0D5DD]"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#101828] truncate">{listing.title}</div>
                            <div className="text-[11px] text-[#667085] font-mono tabular-nums mt-0.5">
                              {listing.sku} · {listing.marketplace.toUpperCase()} · {listing.imagesCount} photos
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Updates image arrays directly on the selected catalog records.</span>
              </div>
            </div>
          )}
        </div>

        {!resultSummary && (
          <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E4E7EC] flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="teal"
              size="sm"
              disabled={selectedListingIds.length === 0}
              isLoading={isApplying}
              onClick={handleApply}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Assign to {selectedListingIds.length} Listing{selectedListingIds.length === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
