import React, { useState } from 'react';
import {
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crop,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { ImageSlotItem, ImageValidationStatus } from '../types/imageWorkspace';
import { STUDIO_FALLBACK_DATA_URI } from '../utils/studioSamples';

interface ImageGalleryWorkspaceProps {
  slots: ImageSlotItem[];
  onSetPrimary: (index: number) => void;
  onMovePosition: (fromIndex: number, toIndex: number) => void;
  onRemoveSlot: (index: number) => void;
  onReplaceUrl: (index: number, newUrl: string) => void;
  onOpenCanvasTool: (slot: ImageSlotItem, index: number) => void;
  onSelectSlotToInspect: (slot: ImageSlotItem) => void;
  selectedSlotId?: string;
}

export const ImageGalleryWorkspace: React.FC<ImageGalleryWorkspaceProps> = ({
  slots,
  onSetPrimary,
  onMovePosition,
  onRemoveSlot,
  onReplaceUrl,
  onOpenCanvasTool,
  onSelectSlotToInspect,
  selectedSlotId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingUrlIndex, setEditingUrlIndex] = useState<number | null>(null);
  const [replaceInput, setReplaceInput] = useState('');

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startReplace = (index: number, currentUrl: string) => {
    setEditingUrlIndex(index);
    setReplaceInput(currentUrl.startsWith('data:') ? '' : currentUrl);
  };

  const confirmReplace = (index: number) => {
    if (replaceInput.trim()) {
      onReplaceUrl(index, replaceInput.trim());
    }
    setEditingUrlIndex(null);
  };

  const getValidationIndicator = (status: ImageValidationStatus) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="px-2 py-0.5 rounded bg-[#101828]/85 text-[#14B8A6] font-semibold text-[10px] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded bg-[#101828]/85 text-amber-300 font-semibold text-[10px] inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Check Spec
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-900/90 text-rose-100 font-semibold text-[10px] inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Error
          </span>
        );
      case 'UNVERIFIED':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-[#101828]/80 text-[#D0D5DD] font-medium text-[10px] inline-flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Unverified
          </span>
        );
    }
  };

  const formatSourceLabel = (slot: ImageSlotItem) => {
    if (slot.title) return slot.title;
    if (slot.url.startsWith('data:image/')) return 'Local Studio Asset';
    return slot.url.replace(/^https?:\/\//, '');
  };

  if (slots.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#D0D5DD] rounded-xl bg-white">
        <div className="w-11 h-11 bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl flex items-center justify-center mx-auto mb-3">
          <Eye className="w-5 h-5 text-[#667085]" />
        </div>
        <h3 className="text-sm font-semibold text-[#101828]">No Image Slots Added</h3>
        <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
          Upload product photos, paste CDN URLs, or load a studio reference frame from the left panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <h3 className="text-sm font-semibold text-[#101828]">Ordered Product Gallery</h3>
          <span className="text-[#D0D5DD]" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-[#667085]">{slots.length} slots</span>
        </div>
        <span className="text-[11px] text-[#667085]">Slot #1 exports as Primary Cover</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {slots.map((slot, index) => {
          const isSelected = selectedSlotId === slot.id;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlotToInspect(slot)}
              className={`group relative bg-white border rounded-xl overflow-hidden transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20'
                  : slot.isPrimary
                  ? 'border-[#101828]/40'
                  : 'border-[#E4E7EC] hover:border-[#D0D5DD]'
              }`}
            >
              {/* Image Box Container */}
              <div className="aspect-square relative overflow-hidden bg-[#F8FAFC]">
                <img
                  src={slot.url}
                  alt={slot.title || `Slot ${slot.position}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imgEl = e.currentTarget;
                    if (imgEl.src !== STUDIO_FALLBACK_DATA_URI) {
                      imgEl.src = STUDIO_FALLBACK_DATA_URI;
                    }
                  }}
                />

                {/* Top Overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-[#101828]/85 text-white font-mono font-semibold tabular-nums text-[10px]">
                    #{slot.position}
                  </span>

                  {slot.isPrimary && (
                    <span className="px-2 py-0.5 rounded bg-[#14B8A6] text-[#101828] font-semibold text-[10px] inline-flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" /> Primary
                    </span>
                  )}
                </div>

                {/* Bottom Status */}
                <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                  {getValidationIndicator(slot.validationStatus)}
                </div>
              </div>

              {/* URL & Quick Actions Bar */}
              <div className="p-3 bg-white border-t border-[#E4E7EC] space-y-2">
                {editingUrlIndex === index ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={replaceInput}
                      onChange={(e) => setReplaceInput(e.target.value)}
                      placeholder="https://cdn.store.com/new.jpg"
                      className="w-full text-[11px] px-2 py-1 bg-[#F8FAFC] border border-[#D0D5DD] rounded focus:outline-none focus:border-[#14B8A6]"
                    />
                    <button
                      type="button"
                      onClick={() => confirmReplace(index)}
                      className="px-2 py-1 bg-[#101828] text-white text-[10px] font-semibold rounded hover:bg-[#1D2939]"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-[#475467] gap-1">
                    <span className="truncate font-medium" title={slot.title || slot.url}>
                      {formatSourceLabel(slot)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(slot.id, slot.url);
                      }}
                      className="p-1 text-[#667085] hover:text-[#101828] shrink-0"
                      title="Copy source"
                    >
                      {copiedId === slot.id ? (
                        <Check className="w-3 h-3 text-[#0F766E]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div className="flex items-center justify-between border-t border-[#E4E7EC] pt-2 text-xs">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePosition(index, index - 1);
                      }}
                      className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 rounded hover:bg-[#F8FAFC]"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slots.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePosition(index, index + 1);
                      }}
                      className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 rounded hover:bg-[#F8FAFC]"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCanvasTool(slot, index);
                      }}
                      className="px-2 py-1 text-[10px] font-semibold text-[#101828] bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#14B8A6] rounded inline-flex items-center gap-1 transition-colors"
                      title="Resize & Crop"
                    >
                      <Crop className="w-3 h-3 text-[#0F766E]" /> Resize
                    </button>

                    {!slot.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetPrimary(index);
                        }}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-[#F8FAFC] border border-[#E4E7EC] text-[#475467] hover:text-[#101828] transition-colors"
                      >
                        Set Main
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startReplace(index, slot.url);
                      }}
                      className="p-1 text-[#667085] hover:text-[#101828] transition-colors"
                      title="Replace Image URL"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSlot(index);
                      }}
                      className="p-1 text-[#667085] hover:text-rose-600 transition-colors"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
