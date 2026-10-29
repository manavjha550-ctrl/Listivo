import React from 'react';
import { BulkImportJob } from '../types/bulk';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

interface ImportHistoryTableProps {
  imports: BulkImportJob[];
  onSelectImport: (importJob: BulkImportJob) => void;
  isLoading?: boolean;
}

export const ImportHistoryTable: React.FC<ImportHistoryTableProps> = ({
  imports,
  onSelectImport,
}) => {
  if (imports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E4E7EC] p-10 text-center text-[#667085] text-xs">
        No past bulk imports recorded yet. Upload a CSV or XLSX catalog to start tracking import batches.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
      <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E4E7EC] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#101828]">Bulk Import History</h3>
        <span className="text-xs font-mono tabular-nums text-[#667085]">
          {imports.length} total jobs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[11px] text-[#667085] font-semibold">
            <tr>
              <th className="px-4 py-3">File Name</th>
              <th className="px-4 py-3">Marketplace</th>
              <th className="px-4 py-3 text-right">Rows</th>
              <th className="px-4 py-3">Breakdown</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Imported At</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC]">
            {imports.map((job) => (
              <tr key={job.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-4 py-3 font-semibold text-[#101828] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#14B8A6] shrink-0" />
                  <span className="truncate max-w-xs">{job.fileName}</span>
                </td>

                <td className="px-4 py-3 font-medium text-[#101828] capitalize">
                  {job.marketplace}
                </td>

                <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#101828]">
                  {job.totalRows}
                </td>

                <td className="px-4 py-3 font-mono tabular-nums text-[11px]">
                  <span className="text-[#0F766E] font-medium">{job.validRows} valid</span>
                  {job.warningRows > 0 && (
                    <span className="text-amber-700 font-medium"> · {job.warningRows} warn</span>
                  )}
                  {job.errorRows > 0 && (
                    <span className="text-rose-700 font-medium"> · {job.errorRows} err</span>
                  )}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {job.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                      Completed
                    </span>
                  )}
                  {job.status === 'COMPLETED_WITH_WARNINGS' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      With Warnings
                    </span>
                  )}
                  {job.status === 'FAILED' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Failed
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-[#667085] font-mono tabular-nums text-[11px] whitespace-nowrap">
                  {new Date(job.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSelectImport(job)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    <span>Open Grid</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
