import React, { useState } from 'react';
import { Download, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { ValidationSummary } from '../types/bulk';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface BulkExportModalProps {
  summary: ValidationSummary;
  marketplace: string;
  onExportCatalog: (format: 'csv' | 'xlsx') => void;
  onExportErrorReport: (format: 'csv' | 'xlsx') => void;
  onClose: () => void;
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  summary,
  marketplace,
  onExportCatalog,
  onExportErrorReport,
  onClose,
}) => {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [exportType, setExportType] = useState<'catalog' | 'errors'>('catalog');

  const hasErrors = summary.errorRows > 0;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Export Catalog or Audit Report"
      subtitle={`Download portal-formatted sheets for ${marketplace.toUpperCase()}.`}
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              if (exportType === 'catalog') {
                onExportCatalog(format);
              } else {
                onExportErrorReport(format);
              }
              onClose();
            }}
          >
            Download .{format.toUpperCase()}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Format */}
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">File Format</label>
          <div className="grid grid-cols-2 gap-2.5">
            {(['csv', 'xlsx'] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormat(fmt)}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  format === fmt
                    ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#0F766E]'
                    : 'border-[#E4E7EC] bg-white text-[#101828] hover:bg-[#F8FAFC]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-[#14B8A6]" />
                <span>{fmt === 'csv' ? 'CSV (.csv)' : 'Excel (.xlsx)'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Package */}
        <div>
          <label className="block text-xs font-medium text-[#101828] mb-1.5">
            Export Content
          </label>
          <div className="space-y-2">
            <label
              className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                exportType === 'catalog'
                  ? 'border-[#14B8A6] bg-[#14B8A6]/5'
                  : 'border-[#E4E7EC] hover:border-[#14B8A6]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'catalog'}
                  onChange={() => setExportType('catalog')}
                  className="mt-0.5 text-[#14B8A6] focus:ring-[#14B8A6]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#101828] block">
                    Product Catalog Sheet ({summary.validRows} valid rows)
                  </span>
                  <span className="text-xs text-[#667085]">
                    Formatted column headers for {marketplace.toUpperCase()} seller upload.
                  </span>
                </div>
              </div>
            </label>

            {summary.totalErrors > 0 && (
              <label
                className={`p-3 rounded-lg border block cursor-pointer transition-colors ${
                  exportType === 'errors'
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-[#E4E7EC] hover:border-rose-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'errors'}
                    onChange={() => setExportType('errors')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#101828] block">
                      Validation Error Audit Report ({summary.totalErrors} issues)
                    </span>
                    <span className="text-xs text-[#667085]">
                      Includes row number, field key, validation message, and current value.
                    </span>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        {hasErrors && exportType === 'catalog' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong className="font-mono tabular-nums font-semibold">
                {summary.errorRows}
              </strong>{' '}
              rows still contain validation errors. Review them in the grid or export the audit report if needed.
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
