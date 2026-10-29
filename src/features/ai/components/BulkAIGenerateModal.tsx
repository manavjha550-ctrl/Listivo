import React, { useState } from 'react';
import { Sparkles, X, Layers, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { aiApiService } from '../services/aiApiService';
import { AIBulkJob } from '../types/ai';

export interface BulkAIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: any[];
  marketplace?: string;
  onApplyResultsToRows: (updatedRows: any[]) => void;
}

export const BulkAIGenerateModal: React.FC<BulkAIGenerateModalProps> = ({
  isOpen,
  onClose,
  rows,
  marketplace = 'meesho',
  onApplyResultsToRows,
}) => {
  const [jobType, setJobType] = useState<'title_batch' | 'description_batch' | 'smart_listing_batch'>('title_batch');
  const [targetScope, setTargetScope] = useState<'all' | 'errors_only'>('all');
  const [isRunning, setIsRunning] = useState(false);
  const [jobResult, setJobResult] = useState<AIBulkJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const errorRowCount = rows.filter((r) => r.status === 'ERROR' || r.status === 'WARNING').length;
  const targetRows =
    targetScope === 'errors_only'
      ? rows.filter((r) => r.status === 'ERROR' || r.status === 'WARNING')
      : rows;

  const handleStartBulkJob = async () => {
    if (targetRows.length === 0) return;

    setIsRunning(true);
    setJobResult(null);
    setErrorMessage(null);

    try {
      const jobItems = targetRows.map((row) => ({
        productId: row.id,
        title: row.data.title || row.data['Product Title'] || '',
        brand: row.data.brand || 'Generic',
        category: row.data.category || 'General',
        material: row.data.material || '',
        rawText: row.data.title || JSON.stringify(row.data),
      }));

      const job = await aiApiService.createBulkAIJob({
        jobType,
        marketplace,
        items: jobItems,
      });

      setJobResult(job);

      const updatedRows = [...rows];
      job.items.forEach((item) => {
        if (item.status === 'SUCCESS' && item.result) {
          const targetRowIndex = updatedRows.findIndex((r) => r.id === item.productId);
          if (targetRowIndex !== -1) {
            const originalData = { ...updatedRows[targetRowIndex].data };
            if (jobType === 'title_batch') {
              originalData.title = item.result.recommendedTitle;
            } else if (jobType === 'description_batch') {
              originalData.description = item.result.description;
              if (item.result.keyFeatures) {
                originalData.keyFeatures = item.result.keyFeatures;
              }
            } else if (jobType === 'smart_listing_batch') {
              originalData.title = item.result.title;
              originalData.description = item.result.description;
              if (item.result.keyFeatures) {
                originalData.keyFeatures = item.result.keyFeatures;
              }
              if (item.result.material) {
                originalData.material = item.result.material;
              }
            }
            updatedRows[targetRowIndex] = {
              ...updatedRows[targetRowIndex],
              data: originalData,
              status: 'MODIFIED',
            };
          }
        }
      });

      onApplyResultsToRows(updatedRows);
    } catch (err: any) {
      setErrorMessage(err.message || 'Bulk catalog generation encountered an error.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/55 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#E4E7EC]">
        <div className="px-5 py-4 border-b border-[#1D2939] bg-[#101828] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Bulk Catalog Copy Generator</h3>
              <p className="text-xs text-[#98A2B3]">Batch-generate titles and descriptions across catalog rows</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#98A2B3] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Target Task Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-[#101828] block">Generation Task</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'title_batch', title: 'Search Titles', desc: 'Marketplace-compliant titles' },
                { id: 'description_batch', title: 'Descriptions', desc: 'Structured catalog copy' },
                { id: 'smart_listing_batch', title: 'Full Smart Copy', desc: 'Titles, copy & attributes' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setJobType(opt.id as any)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    jobType === opt.id
                      ? 'border-[#14B8A6] bg-[#14B8A6]/5 text-[#101828]'
                      : 'border-[#E4E7EC] bg-white hover:bg-[#F8FAFC] text-[#475467]'
                  }`}
                >
                  <div className="font-semibold text-[#101828]">{opt.title}</div>
                  <div className="text-[11px] text-[#667085] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope selection */}
          <div className="space-y-2">
            <label className="font-semibold text-[#101828] block">Target Row Scope</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E4E7EC]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'all'}
                  onChange={() => setTargetScope('all')}
                  className="accent-[#101828]"
                />
                <span className="font-medium text-[#101828]">
                  All Rows (<span className="font-mono tabular-nums">{rows.length}</span>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'errors_only'}
                  onChange={() => setTargetScope('errors_only')}
                  className="accent-[#101828]"
                />
                <span className="font-medium text-[#101828]">
                  Rows with Issues Only (<span className="font-mono tabular-nums">{errorRowCount}</span>)
                </span>
              </label>
            </div>
          </div>

          {/* Target Marketplace info */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] text-[#475467]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              <span>Marketplace Rule Profile</span>
            </div>
            <span className="font-semibold uppercase tracking-wider text-[#101828]">{marketplace}</span>
          </div>

          {/* Job Completion Progress Banner */}
          {jobResult && (
            <div className="p-4 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg space-y-1">
              <div className="font-semibold text-[#101828] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                <span>Batch Generation Complete</span>
              </div>
              <p className="text-[#475467] text-xs">
                Updated{' '}
                <strong className="font-mono tabular-nums text-[#101828]">{jobResult.completedItems}</strong> of{' '}
                <span className="font-mono tabular-nums">{jobResult.totalItems}</span> spreadsheet rows.
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-[#E4E7EC] bg-[#F8FAFC] flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="teal"
            size="sm"
            onClick={handleStartBulkJob}
            isLoading={isRunning}
            disabled={targetRows.length === 0}
          >
            <Play className="w-3.5 h-3.5 mr-1.5" /> Run Batch ({targetRows.length} rows)
          </Button>
        </div>
      </div>
    </div>
  );
};
