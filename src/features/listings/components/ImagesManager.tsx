import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Upload,
  Link as LinkIcon,
  ArrowUpRight,
} from 'lucide-react';
import { ListingImage } from '../types/listing';
import { Button } from '../../../components/ui/Button';

interface ImagesManagerProps {
  images: ListingImage[];
  setImages: React.Dispatch<React.SetStateAction<ListingImage[]>>;
  primaryImageIndex: number;
  setPrimaryImageIndex: (idx: number) => void;
}

const FALLBACK_PRODUCT_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23F8FAFC'/><rect x='110' y='90' width='180' height='220' rx='16' fill='%23FFFFFF' stroke='%23E4E7EC' stroke-width='4'/><circle cx='200' cy='175' r='34' fill='%2314B8A6' fill-opacity='0.18'/><path d='M150 250h100' stroke='%23101828' stroke-width='6' stroke-linecap='round'/><path d='M170 272h60' stroke='%23667085' stroke-width='4' stroke-linecap='round'/></svg>";

export const ImagesManager: React.FC<ImagesManagerProps> = ({
  images,
  setImages,
  primaryImageIndex,
  setPrimaryImageIndex,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const newImg: ListingImage = {
      id: `img-${Date.now()}`,
      url: urlInput.trim(),
      isPrimary: images.length === 0,
    };
    setImages((prev) => [...prev, newImg]);
    setUrlInput('');
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              url: reader.result as string,
              isPrimary: prev.length === 0,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index);
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index === primaryImageIndex && next.length > 0) {
        setPrimaryImageIndex(0);
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload & URL Controls */}
      <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-[#101828] text-xs">Product Image Gallery</h4>
            <p className="text-xs text-[#667085]">
              Upload clean front, back, and detail shots (minimum 1 primary cover required).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/image-maker"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F8FAFC] border border-[#E4E7EC] text-[#101828] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Open Image Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#667085]" />
            </Link>
            <span className="text-xs font-mono tabular-nums font-semibold text-[#101828]">
              {images.length} / 8 slots
            </span>
          </div>
        </div>

        {/* File Upload + Hosted URL Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            Upload Photos
          </Button>

          <div className="relative flex-1">
            <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
              placeholder="Or paste hosted image URL (https://...)"
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] text-[#101828]"
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddUrl}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Add URL
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="py-12 px-4 text-center border border-dashed border-[#E4E7EC] rounded-xl bg-[#F8FAFC]">
          <ImageIcon className="w-6 h-6 text-[#667085] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#101828]">No product images added yet</p>
          <p className="text-xs text-[#667085] mt-1">
            Upload product photos from your device or paste hosted CDN URLs above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`bg-white border rounded-xl overflow-hidden transition-colors flex flex-col justify-between ${
                img.isPrimary
                  ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20'
                  : 'border-[#E4E7EC]'
              }`}
            >
              <div className="aspect-square relative overflow-hidden bg-[#F8FAFC]">
                <img
                  src={img.url}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_SVG;
                  }}
                />

                {img.isPrimary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#101828]/90 text-white font-semibold text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#14B8A6] text-[#14B8A6]" /> Primary Cover
                  </span>
                )}
              </div>

              <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E4E7EC] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className={`text-xs font-semibold transition-colors cursor-pointer ${
                    img.isPrimary
                      ? 'text-[#0F766E]'
                      : 'text-[#667085] hover:text-[#101828]'
                  }`}
                >
                  {img.isPrimary ? 'Main Cover' : 'Set Primary'}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-[#667085] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
