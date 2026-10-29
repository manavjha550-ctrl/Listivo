import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { templateService } from '../../templates/services/templateService';
import { ListingTemplate } from '../../templates/types/template';

interface StartFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  onStartScratch: () => void;
}

export const StartFromTemplateModal: React.FC<StartFromTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onStartScratch,
}) => {
  const [templates, setTemplates] = useState<ListingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      templateService
        .getTemplates()
        .then((res) => setTemplates(res.data))
        .catch(() => setTemplates([]))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.marketplace.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Product Listing"
      subtitle="Start from a saved category template or build a blank listing."
      maxWidth="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Start from Scratch */}
        <button
          type="button"
          onClick={onStartScratch}
          className="w-full text-left border border-dashed border-[#E4E7EC] hover:border-[#14B8A6] bg-[#F8FAFC] hover:bg-white rounded-xl p-4 cursor-pointer transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-[#E4E7EC] flex items-center justify-center text-[#101828] group-hover:border-[#14B8A6] group-hover:text-[#0F766E] transition-colors shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-[#101828] text-xs">Start from Scratch</h4>
              <p className="text-xs text-[#667085] mt-0.5">
                Enter title, SKU, pricing, images, and marketplace attributes manually.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#667085] group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E4E7EC] w-full" />
          <span className="bg-white px-3 text-xs font-medium text-[#667085] relative whitespace-nowrap">
            Or choose a template
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name, category, or platform..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:outline-none focus:border-[#14B8A6] text-[#101828]"
          />
        </div>

        {/* Templates */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#667085]">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-[#E4E7EC]">
            <Layers className="w-6 h-6 text-[#667085] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#101828]">No matching templates found</p>
            <p className="text-xs text-[#667085] mt-0.5">
              Create reusable templates in the Templates module to prefill GST, HSN, and attributes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
            {filteredTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onSelectTemplate(tpl.id)}
                className="text-left border border-[#E4E7EC] hover:border-[#14B8A6] bg-white rounded-xl p-3.5 cursor-pointer transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#667085] mb-1">
                    <span className="font-semibold text-[#0F766E] capitalize">
                      {tpl.marketplace}
                    </span>
                    <span className="font-mono text-[11px]">{tpl.skuPrefix}</span>
                  </div>
                  <h4 className="font-semibold text-[#101828] text-xs line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 truncate">{tpl.category}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E4E7EC] flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums font-semibold text-[#101828]">
                    ₹{tpl.defaultPrice}
                  </span>
                  <span className="text-[#0F766E] font-semibold flex items-center gap-1">
                    Use Template <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
