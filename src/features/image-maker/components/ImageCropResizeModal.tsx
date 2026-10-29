import React, { useState, useEffect } from 'react';
import { X, Crop, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ImageSlotItem, ProcessedImageResult } from '../types/imageWorkspace';
import { imageProcessingService } from '../services/imageProcessingService';
import { Button } from '../../../components/ui/Button';

interface ImageCropResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ImageSlotItem | null;
  onApplyProcessedImage: (processedUrl: string) => void;
}

export const ImageCropResizeModal: React.FC<ImageCropResizeModalProps> = ({
  isOpen,
  onClose,
  slot,
  onApplyProcessedImage,
}) => {
  const [targetWidth, setTargetWidth] = useState(1000);
  const [targetHeight, setTargetHeight] = useState(1000);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [quality, setQuality] = useState(0.85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (slot && isOpen) {
      setTargetWidth(slot.width || 1000);
      setTargetHeight(slot.height || 1000);
      setProcessedResult(null);
      setErrorMsg(null);
    }
  }, [slot, isOpen]);

  if (!isOpen || !slot) return null;

  const handleProcess = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await imageProcessingService.processImageCanvas(slot.url, {
        width: targetWidth,
        height: targetHeight,
        format,
        quality,
      });
      setProcessedResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to process image canvas. Ensure image source permits browser access.');
    } finally {
      setIsProcessing(false);
    }
  };

  const setPreset = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleConfirm = () => {
    if (processedResult) {
      onApplyProcessedImage(processedResult.processedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/55 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-[#E4E7EC] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#101828] text-white flex items-center justify-between border-b border-[#1D2939]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#14B8A6]/15 border border-[#14B8A6]/30 rounded-lg text-[#14B8A6] flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Browser Canvas Resize & Compression</h3>
              <p className="text-xs text-[#98A2B3]">
                Standardize marketplace dimensions and output format locally in your browser
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

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#475467] block mb-1.5">
                  Marketplace Dimension Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { w: 1000, h: 1000, label: '1000×1000' },
                    { w: 800, h: 800, label: '800×800' },
                    { w: 1080, h: 1440, label: '1080×1440' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPreset(p.w, p.h)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-mono font-semibold tabular-nums transition-colors ${
                        targetWidth === p.w && targetHeight === p.h
                          ? 'bg-[#101828] border-[#101828] text-white'
                          : 'bg-[#F8FAFC] border-[#E4E7EC] text-[#475467] hover:bg-white hover:text-[#101828]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#475467] block mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#475467] block mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#475467] block mb-1">Output Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828]"
                  >
                    <option value="jpeg">JPEG (.jpg)</option>
                    <option value="png">PNG (.png)</option>
                    <option value="webp">WEBP (.webp)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475467] block mb-1">
                    Quality (<span className="font-mono tabular-nums">{Math.round(quality * 100)}%</span>)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-[#14B8A6] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleProcess}
                isLoading={isProcessing}
                className="w-full justify-center"
                icon={<Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />}
              >
                Render Canvas Preview
              </Button>
            </div>

            {/* Preview & Stats Comparison */}
            <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-2">
                  Processed Output
                </span>
                <div className="aspect-square bg-white border border-[#E4E7EC] rounded-lg overflow-hidden relative flex items-center justify-center">
                  {processedResult ? (
                    <img
                      src={processedResult.processedUrl}
                      alt="Processed output"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-4 text-[#667085]">
                      <ImageIcon className="w-7 h-7 mx-auto mb-1.5 text-[#98A2B3]" />
                      <p className="text-xs">Click Render Canvas Preview to inspect output</p>
                    </div>
                  )}
                </div>
              </div>

              {processedResult && (
                <div className="bg-white p-3 rounded-lg border border-[#E4E7EC] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#667085]">
                    <span>Source</span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      {processedResult.originalDimensions.w} × {processedResult.originalDimensions.h} px
                    </span>
                  </div>
                  <div className="flex justify-between text-[#667085]">
                    <span>Output</span>
                    <span className="font-mono font-semibold tabular-nums text-[#0F766E]">
                      {processedResult.processedDimensions.w} × {processedResult.processedDimensions.h} px
                    </span>
                  </div>
                  <div className="flex justify-between text-[#667085] border-t border-[#E4E7EC] pt-1.5">
                    <span>Estimated File Size</span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      ~{processedResult.processedSizeEstKb} KB ({processedResult.format})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-t border-[#E4E7EC] flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="teal"
            size="sm"
            disabled={!processedResult}
            onClick={handleConfirm}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Apply to Slot
          </Button>
        </div>
      </div>
    </div>
  );
};
