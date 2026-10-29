import React from 'react';
import { AlertTriangle, CheckCircle2, X, Info } from 'lucide-react';
import { ValidationResults } from '../types/listing';
import { Button } from '../../../components/ui/Button';

interface ValidationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationResults;
  onNavigateSection?: (section: string) => void;
}

export const ValidationDrawer: React.FC<ValidationDrawerProps> = ({
  isOpen,
  onClose,
  validation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-[#101828]/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl border-l border-[#E4E7EC] flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {validation.isValid ? (
              <div className="p-2 rounded-lg bg-[#14B8A6]/10 text-[#0F766E]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-[#101828] text-sm">Listing Validation Report</h3>
              <p className="text-xs text-[#667085]">Real-time marketplace readiness check</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close validation drawer"
            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Strip */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E4E7EC] grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
            <span className="text-[11px] text-[#667085] block">Passed</span>
            <span className="font-mono tabular-nums font-bold text-[#0F766E] text-base">
              {validation.validCount}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
            <span className="text-[11px] text-[#667085] block">Errors</span>
            <span className="font-mono tabular-nums font-bold text-rose-600 text-base">
              {validation.errorCount}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-[#E4E7EC]">
            <span className="text-[11px] text-[#667085] block">Warnings</span>
            <span className="font-mono tabular-nums font-bold text-amber-600 text-base">
              {validation.warningCount}
            </span>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {validation.issues.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#14B8A6] mx-auto" />
              <h4 className="font-semibold text-[#101828] text-sm">All Checks Passed</h4>
              <p className="text-xs text-[#667085] max-w-xs mx-auto">
                This listing meets required field, pricing, and tax rules for marketplace export.
              </p>
            </div>
          ) : (
            validation.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border flex items-start gap-3 ${
                  issue.severity === 'error'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                {issue.severity === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-medium text-[#667085] capitalize">{issue.section}</span>
                    <span
                      className={`font-semibold capitalize text-[11px] ${
                        issue.severity === 'error' ? 'text-rose-700' : 'text-amber-700'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="font-medium text-[#101828]">{issue.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E7EC] bg-white">
          <Button variant="secondary" size="sm" onClick={onClose} className="w-full">
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
};
