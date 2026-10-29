import React from 'react';
import { DBTemplate } from '../../../../server/db/schema';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface TemplateSelectStepProps {
  templates: DBTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string | null) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const TemplateSelectStep: React.FC<TemplateSelectStepProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onConfirm,
  onBack,
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] space-y-2">
        <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-[#14B8A6] flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-[#101828]">
          Apply Template Defaults (Optional)
        </h3>
        <p className="text-xs text-[#667085] leading-relaxed">
          Select a saved LISTIVO template to fill missing fields (such as GST slab, HSN code, or brand) on incomplete rows. Values already present in your spreadsheet are preserved.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* No Template Option */}
        <button
          type="button"
          onClick={() => onSelectTemplate(null)}
          className={`text-left p-4 rounded-xl border cursor-pointer transition-colors ${
            selectedTemplateId === null
              ? 'border-[#14B8A6] bg-[#14B8A6]/5 ring-2 ring-[#14B8A6]/20'
              : 'border-[#E4E7EC] bg-white hover:border-[#14B8A6]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-[#101828]">
                No Template (Spreadsheet Values Only)
              </h4>
              <p className="text-xs text-[#667085] mt-1">
                Validate and import strictly using values supplied in your uploaded file.
              </p>
            </div>
            {selectedTemplateId === null && (
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
            )}
          </div>
        </button>

        {/* Saved Templates */}
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelectTemplate(tpl.id)}
              className={`text-left p-4 rounded-xl border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-[#14B8A6] bg-[#14B8A6]/5 ring-2 ring-[#14B8A6]/20'
                  : 'border-[#E4E7EC] bg-white hover:border-[#14B8A6]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[#0F766E] font-semibold capitalize mb-0.5">
                    {tpl.marketplace}
                  </div>
                  <h4 className="text-sm font-semibold text-[#101828] truncate">{tpl.name}</h4>
                  <p className="text-xs font-mono tabular-nums text-[#667085] mt-1 truncate">
                    GST {tpl.gstRate}% · HSN {tpl.hsnCode} · {tpl.brand || 'Unbranded'}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EC]">
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          Back
        </Button>

        <Button type="button" variant="primary" size="md" onClick={onConfirm}>
          <span>Validate Catalog Grid</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
