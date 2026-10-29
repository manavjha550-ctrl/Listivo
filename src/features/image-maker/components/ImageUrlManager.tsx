import React, { useState, useRef } from 'react';
import { Link as LinkIcon, Plus, AlertTriangle, Upload } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { STUDIO_CATALOG_SAMPLES } from '../utils/studioSamples';

interface ImageUrlManagerProps {
  onAddUrls: (urls: string[]) => void;
  existingUrls: string[];
}

export const ImageUrlManager: React.FC<ImageUrlManagerProps> = ({ onAddUrls, existingUrls }) => {
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = singleUrl.trim();
    if (!trimmed) return;

    if (existingUrls.includes(trimmed)) {
      setDuplicateWarning('This image URL is already present in your gallery.');
      return;
    }

    setDuplicateWarning(null);
    onAddUrls([trimmed]);
    setSingleUrl('');
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const parsedUrls = bulkText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && /^https?:\/\/.+/i.test(s));

    if (parsedUrls.length === 0) {
      setDuplicateWarning('No valid HTTP/HTTPS URLs found in pasted lines.');
      return;
    }

    setDuplicateWarning(null);
    onAddUrls(parsedUrls);
    setBulkText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files);
    const loadedUrls: string[] = [];
    let processed = 0;

    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' && !existingUrls.includes(reader.result)) {
          loadedUrls.push(reader.result);
        }
        processed += 1;
        if (processed === fileArray.length && loadedUrls.length > 0) {
          setDuplicateWarning(null);
          onAddUrls(loadedUrls);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddSample = (sampleUrl: string) => {
    if (existingUrls.includes(sampleUrl)) {
      setDuplicateWarning('This studio frame is already in your active gallery.');
      return;
    }
    setDuplicateWarning(null);
    onAddUrls([sampleUrl]);
  };

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#E4E7EC] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#101828] flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-[#0F766E]" />
            <span>Add Product Media</span>
          </h3>
          <p className="text-[11px] text-[#667085] mt-0.5">Upload files or paste CDN image URLs</p>
        </div>
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-0.5 rounded-lg border border-[#E4E7EC] text-[11px] font-medium">
          <button
            type="button"
            onClick={() => {
              setActiveTab('single');
              setDuplicateWarning(null);
            }}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'single' ? 'bg-white text-[#101828] font-semibold shadow-2xs' : 'text-[#667085]'
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('bulk');
              setDuplicateWarning(null);
            }}
            className={`px-2 py-1 rounded-md transition-colors ${
              activeTab === 'bulk' ? 'bg-white text-[#101828] font-semibold shadow-2xs' : 'text-[#667085]'
            }`}
          >
            Bulk
          </button>
        </div>
      </div>

      {duplicateWarning && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>{duplicateWarning}</span>
        </div>
      )}

      {activeTab === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={singleUrl}
              onChange={(e) => {
                setSingleUrl(e.target.value);
                setDuplicateWarning(null);
              }}
              placeholder="https://cdn.store.com/product.jpg"
              className="flex-1 px-3 py-2 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828]"
            />
            <Button type="submit" variant="teal" size="sm" disabled={!singleUrl.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="space-y-2.5">
          <textarea
            rows={3}
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              setDuplicateWarning(null);
            }}
            placeholder={'https://cdn.store.com/front.jpg\nhttps://cdn.store.com/back.jpg'}
            className="w-full p-2.5 text-xs font-mono bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg focus:outline-none focus:bg-white focus:border-[#14B8A6] text-[#101828] resize-none"
          />
          <Button type="submit" variant="teal" size="xs" className="w-full justify-center">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add URLs
          </Button>
        </form>
      )}

      {/* Local File Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => fileInputRef.current?.click()}
          className="w-full justify-center"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5 text-[#0F766E]" />
          Upload Local Image Files
        </Button>
      </div>

      <div className="pt-2 border-t border-[#E4E7EC]">
        <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block mb-2">
          Studio Reference Frames
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {STUDIO_CATALOG_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleAddSample(sample.url)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] hover:bg-[#14B8A6]/5 border border-[#E4E7EC] hover:border-[#14B8A6] rounded-lg text-[11px] font-medium text-[#475467] hover:text-[#101828] transition-colors flex items-center gap-1 text-left truncate"
            >
              <Plus className="w-3 h-3 text-[#0F766E] shrink-0" />
              <span className="truncate">{sample.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
