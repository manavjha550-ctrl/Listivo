import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ImageSlotItem } from '../features/image-maker/types/imageWorkspace';
import { ImageUrlManager } from '../features/image-maker/components/ImageUrlManager';
import { ImageGalleryWorkspace } from '../features/image-maker/components/ImageGalleryWorkspace';
import { ImageCropResizeModal } from '../features/image-maker/components/ImageCropResizeModal';
import { ApplyImagesToListingModal } from '../features/image-maker/components/ApplyImagesToListingModal';
import { ImageDetailsInspector } from '../features/image-maker/components/ImageDetailsInspector';
import { imageValidationService } from '../features/image-maker/services/imageValidationService';
import { STUDIO_CATALOG_SAMPLES } from '../features/image-maker/utils/studioSamples';

export const ImageMakerPage: React.FC = () => {
  const [slots, setSlots] = useState<ImageSlotItem[]>(() =>
    STUDIO_CATALOG_SAMPLES.slice(0, 3).map((sample, idx) => ({
      id: `img-init-${idx + 1}`,
      url: sample.url,
      position: idx + 1,
      isPrimary: idx === 0,
      title: sample.title,
      validationStatus: 'VALID',
      validationMessage: 'Meets Meesho spec (1000×1000px, 1:1 ratio).',
      width: 1000,
      height: 1000,
      aspectRatio: '1:1',
    }))
  );

  const [targetMarketplace, setTargetMarketplace] = useState('meesho');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0]?.id || '');
  const [availableListings, setAvailableListings] = useState<any[]>([]);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [activeSlotForCrop, setActiveSlotForCrop] = useState<ImageSlotItem | null>(null);
  const [activeCropIndex, setActiveCropIndex] = useState<number>(-1);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableListings(
          data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            sku: p.sku,
            marketplace: p.marketplace || 'meesho',
            imagesCount: p.images ? p.images.length : 0,
            variants: p.variants || [],
          }))
        );
      }
    } catch {
      // Keep empty list if products endpoint is unreachable
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddUrls = async (urlsToAdd: string[]) => {
    const newItems: ImageSlotItem[] = [];

    for (let i = 0; i < urlsToAdd.length; i++) {
      const url = urlsToAdd[i];
      const pos = slots.length + newItems.length + 1;

      const validation = await imageValidationService.checkImageAccessibilityAndDimensions(
        url,
        targetMarketplace
      );

      newItems.push({
        id: `img-${Date.now()}-${i}`,
        url,
        position: pos,
        isPrimary: slots.length === 0 && i === 0,
        validationStatus: validation.status,
        validationMessage: validation.messages[0] || 'Validation pending',
        width: validation.width,
        height: validation.height,
        aspectRatio: validation.aspectRatio,
      });
    }

    setSlots((prev) => {
      const updated = [...prev, ...newItems];
      if (updated.length > 0 && !updated.some((s) => s.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });

    if (newItems.length > 0 && !selectedSlotId) {
      setSelectedSlotId(newItems[0].id);
    }

    showToast(`Added ${newItems.length} image slot${newItems.length > 1 ? 's' : ''} to gallery.`);
  };

  const handleSetPrimary = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => ({
        ...s,
        isPrimary: i === index,
      }))
    );
    showToast(`Slot #${index + 1} set as Primary Cover.`);
  };

  const handleMovePosition = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= slots.length) return;
    setSlots((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((item, i) => ({
        ...item,
        position: i + 1,
        isPrimary: i === 0 ? true : item.isPrimary,
      }));
    });
  };

  const handleRemoveSlot = (index: number) => {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((item, i) => ({
        ...item,
        position: i + 1,
        isPrimary: i === 0 ? true : item.isPrimary,
      }));
    });
    showToast('Removed image slot from gallery.');
  };

  const handleReplaceUrl = async (index: number, newUrl: string) => {
    const validation = await imageValidationService.checkImageAccessibilityAndDimensions(
      newUrl,
      targetMarketplace
    );

    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          return {
            ...slot,
            url: newUrl,
            title: undefined,
            validationStatus: validation.status,
            validationMessage: validation.messages[0],
            width: validation.width,
            height: validation.height,
            aspectRatio: validation.aspectRatio,
          };
        }
        return slot;
      })
    );

    showToast(`Updated image source for Slot #${index + 1}.`);
  };

  const handleOpenCanvasTool = (slot: ImageSlotItem, index: number) => {
    setActiveSlotForCrop(slot);
    setActiveCropIndex(index);
    setIsCropModalOpen(true);
  };

  const handleApplyProcessedCanvas = (processedDataUrl: string) => {
    if (activeCropIndex >= 0) {
      setSlots((prev) =>
        prev.map((slot, i) => {
          if (i === activeCropIndex) {
            return {
              ...slot,
              url: processedDataUrl,
              validationStatus: 'VALID',
              validationMessage: 'Processed via browser canvas resize & compression.',
            };
          }
          return slot;
        })
      );
      showToast('Applied resized canvas output to slot.');
    }
  };

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0] || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">Image Workspace</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Order multi-slot product galleries, validate marketplace dimensions, resize in browser, and assign to SKUs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="teal"
            size="sm"
            onClick={() => setIsApplyModalOpen(true)}
            disabled={slots.length === 0}
            icon={<Layers className="w-3.5 h-3.5" />}
          >
            Assign to Listings ({slots.length})
          </Button>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-xs ${
            toastMsg.type === 'success'
              ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#101828]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            aria-label="Dismiss notification"
            className="text-[#667085] hover:text-[#101828] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Responsive 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tools & URL Input Controls */}
        <div className="lg:col-span-3 space-y-4">
          <ImageUrlManager onAddUrls={handleAddUrls} existingUrls={slots.map((s) => s.url)} />

          <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-semibold text-[#101828] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Gallery Summary</span>
            </h4>
            <div className="space-y-1.5 text-xs text-[#667085]">
              <div className="flex justify-between">
                <span>Active Slots</span>
                <span className="font-mono font-semibold tabular-nums text-[#101828]">{slots.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Spec Compliant</span>
                <span className="font-mono font-semibold tabular-nums text-[#0F766E]">
                  {slots.filter((s) => s.validationStatus === 'VALID').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Needs Review</span>
                <span className="font-mono font-semibold tabular-nums text-amber-700">
                  {slots.filter((s) => s.validationStatus !== 'VALID').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Gallery & Slot Canvas */}
        <div className="lg:col-span-6 space-y-6">
          <ImageGalleryWorkspace
            slots={slots}
            onSetPrimary={handleSetPrimary}
            onMovePosition={handleMovePosition}
            onRemoveSlot={handleRemoveSlot}
            onReplaceUrl={handleReplaceUrl}
            onOpenCanvasTool={handleOpenCanvasTool}
            onSelectSlotToInspect={(slot) => setSelectedSlotId(slot.id)}
            selectedSlotId={selectedSlotId}
          />
        </div>

        {/* Right Column: Image Details & Validation Inspector */}
        <div className="lg:col-span-3 space-y-6">
          <ImageDetailsInspector
            selectedSlot={selectedSlot}
            targetMarketplace={targetMarketplace}
            onTargetMarketplaceChange={(mp) => setTargetMarketplace(mp)}
          />
        </div>
      </div>

      {/* Canvas Crop & Resize Modal */}
      <ImageCropResizeModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        slot={activeSlotForCrop}
        onApplyProcessedImage={handleApplyProcessedCanvas}
      />

      {/* Apply to Listings Modal */}
      <ApplyImagesToListingModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        slots={slots}
        availableListings={availableListings}
        onSuccessApply={(ids) => {
          showToast(`Assigned image gallery to ${ids.length} catalog listing(s).`);
          fetchListings();
        }}
      />
    </div>
  );
};
