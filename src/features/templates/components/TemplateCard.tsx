import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Copy,
  PlusCircle,
  Trash2,
  Edit,
  MoreVertical,
} from 'lucide-react';
import { ListingTemplate } from '../types/template';
import { Button } from '../../../components/ui/Button';

interface TemplateCardProps {
  template: ListingTemplate;
  onDuplicate: (id: string) => Promise<void>;
  onCreateListing: (id: string) => Promise<void>;
  onDeleteRequest: (template: ListingTemplate) => void;
  onErrorFeedback?: (message: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onDuplicate,
  onCreateListing,
  onDeleteRequest,
  onErrorFeedback,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsDuplicating(true);
    try {
      await onDuplicate(template.id);
    } catch (err: any) {
      onErrorFeedback?.(err.message || 'Duplication failed.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleCreateListing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setIsCreatingListing(true);
    try {
      await onCreateListing(template.id);
      navigate('/listings');
    } catch (err: any) {
      onErrorFeedback?.(err.message || 'Could not create listing from template.');
    } finally {
      setIsCreatingListing(false);
    }
  };

  const formatPlatform = (platform: string) => {
    const p = (platform || 'meesho').toLowerCase();
    if (p === 'meesho') return 'Meesho';
    if (p === 'flipkart') return 'Flipkart';
    if (p === 'amazon') return 'Amazon India';
    if (p === 'myntra') return 'Myntra';
    return platform;
  };

  const primaryImage = template.images && template.images.length > 0 ? template.images[0] : null;

  return (
    <div
      onClick={() => navigate(`/templates/${template.id}`)}
      className="group relative bg-white border border-[#E4E7EC] hover:border-[#14B8A6] rounded-xl p-5 transition-colors cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Clean kicker + menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#667085]">
            <span className="font-semibold text-[#0F766E]">
              {formatPlatform(template.marketplace)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{template.category}</span>
            {template.isDefault && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#101828]">Default</span>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Template options"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-md transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-[#E4E7EC] rounded-lg shadow-lg py-1 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      navigate(`/templates/${template.id}`);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F8FAFC] text-[#101828] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#667085]" /> Edit Template
                  </button>

                  <button
                    type="button"
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F8FAFC] text-[#101828] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#667085]" /> Duplicate
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateListing}
                    disabled={isCreatingListing}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#14B8A6]/10 text-[#0F766E] font-semibold flex items-center gap-2 cursor-pointer border-y border-[#E4E7EC]"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-[#14B8A6]" /> Create Listing
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDeleteRequest(template);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title & Thumbnail */}
        <div className="flex items-start gap-3">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={template.name}
              className="w-11 h-11 rounded-lg object-cover border border-[#E4E7EC] shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center shrink-0 text-[#667085]">
              <FileText className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[#101828] group-hover:text-[#0F766E] transition-colors line-clamp-1">
              {template.name}
            </h3>
            <p className="text-xs text-[#667085] mt-0.5 truncate">
              {template.brand || 'Unbranded'}
              {template.subCategory ? ` · ${template.subCategory}` : ''}
            </p>
          </div>
        </div>

        {/* Clean Hairline Spec Summary */}
        <div className="mt-4 pt-3 border-t border-[#E4E7EC] grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-[#667085] block">Tax &amp; HSN</span>
            <span className="font-mono tabular-nums font-medium text-[#101828]">
              GST {template.gstRate}% · {template.hsnCode}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#667085] block">Coverage</span>
            <span className="font-mono tabular-nums font-medium text-[#101828]">
              {template.attributes?.length || 0} attrs · {template.listingsCount || 0} items
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono tabular-nums text-[#667085]">
          Updated {new Date(template.updatedAt).toLocaleDateString()}
        </span>

        <Button
          variant="primary"
          size="xs"
          icon={<PlusCircle className="w-3.5 h-3.5" />}
          isLoading={isCreatingListing}
          onClick={handleCreateListing}
        >
          Create Listing
        </Button>
      </div>
    </div>
  );
};
