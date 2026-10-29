import React, { useState } from 'react';
import { ValidationSummary, BulkRow } from '../types/bulk';
import { AlertCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface ErrorSummaryPanelProps {
  summary: ValidationSummary;
  rows: BulkRow[];
  onSelectRowError: (rowIndex: number, fieldKey: string) => void;
  onFilterByStatus: (status: 'ALL' | 'ERROR' | 'WARNING' | 'VALID' | 'MODIFIED') => void;
  activeFilter: string;
}

export const ErrorSummaryPanel: React.FC<ErrorSummaryPanelProps> = ({
  summary,
  rows,
  onSelectRowError,
  onFilterByStatus,
  activeFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const fieldErrorsMap = new Map<
    string,
    { field: string; count: number; sampleMessage: string; rowIndices: number[] }
  >();

  rows.forEach((row) => {
    row.errors.forEach((err) => {
      const key = `${err.field}_${err.severity}`;
      if (!fieldErrorsMap.has(key)) {
        fieldErrorsMap.set(key, {
          field: err.field,
          count: 0,
          sampleMessage: err.message,
          rowIndices: [],
        });
      }
      const item = fieldErrorsMap.get(key)!;
      item.count++;
      item.rowIndices.push(row.rowIndex);
    });
  });

  const errorGroups = Array.from(fieldErrorsMap.values());

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden">
      {/* Summary Header */}
      <div className="p-4 bg-[#F8FAFC] border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#101828] text-sm">Validation Summary</span>
          <span className="text-[#E4E7EC]">|</span>
          <span className="font-mono tabular-nums font-semibold text-[#0F766E]">
            {summary.validRows} valid
          </span>
          {summary.warningRows > 0 && (
            <>
              <span aria-hidden="true" className="text-[#667085]">·</span>
              <span className="font-mono tabular-nums font-semibold text-amber-700">
                {summary.warningRows} warnings
              </span>
            </>
          )}
          {summary.errorRows > 0 && (
            <>
              <span aria-hidden="true" className="text-[#667085]">·</span>
              <span className="font-mono tabular-nums font-semibold text-rose-700">
                {summary.errorRows} errors
              </span>
            </>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E4E7EC] bg-white p-0.5 text-xs">
            {[
              { key: 'ALL', label: `All (${summary.totalRows})` },
              { key: 'VALID', label: `Valid (${summary.validRows})` },
              { key: 'ERROR', label: `Errors (${summary.errorRows})` },
              { key: 'WARNING', label: `Warnings (${summary.warningRows})` },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterByStatus(f.key as any)}
                className={`px-2.5 py-1 rounded-md font-medium font-mono tabular-nums transition-colors cursor-pointer ${
                  activeFilter === f.key
                    ? 'bg-[#101828] text-white'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {errorGroups.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle error breakdown"
              className="p-1.5 text-[#667085] hover:text-[#101828] rounded-lg hover:bg-white border border-transparent hover:border-[#E4E7EC] transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Click-to-Fix Field Issues */}
      {isExpanded && errorGroups.length > 0 && (
        <div className="p-4 bg-white space-y-2.5 max-h-48 overflow-y-auto">
          <p className="text-xs text-[#667085]">
            Select any field issue below to jump directly to the affected cell in the spreadsheet:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {errorGroups.map((grp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectRowError(grp.rowIndices[0], grp.field)}
                className="text-left p-3 bg-[#F8FAFC] border border-[#E4E7EC] hover:border-[#14B8A6] rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-2 group"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-semibold text-[#101828] font-mono">{grp.field}</span>
                    <span className="text-[11px] font-mono tabular-nums text-rose-700 font-medium">
                      ({grp.count} {grp.count === 1 ? 'row' : 'rows'})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085] line-clamp-1">{grp.sampleMessage}</p>
                </div>

                <span className="text-[#0F766E] text-xs font-semibold flex items-center gap-0.5 shrink-0 mt-0.5">
                  <span>Fix</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
