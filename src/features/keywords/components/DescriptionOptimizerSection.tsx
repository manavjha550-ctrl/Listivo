import React, { useState } from 'react';
import { FileText, Sparkles, Check, ArrowRight, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DescriptionOptimizationResult } from '../types/keywordTypes';
import { keywordApiService } from '../services/keywordApiService';

interface DescriptionOptimizerSectionProps {
  selectedKeywords: string[];
  productName: string;
  marketplace: string;
  onApplyDescription?: (description: string) => void;
}

export const DescriptionOptimizerSection: React.FC<DescriptionOptimizerSectionProps> = ({
  selectedKeywords,
  productName,
  marketplace,
  onApplyDescription,
}) => {
  const [existingDesc, setExistingDesc] = useState(
    'Women cotton rayon printed straight kurti. Soft and comfortable fabric. Daily wear design for office and home.'
  );
  const [result, setResult] = useState<DescriptionOptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOptimize = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await keywordApiService.optimizeDescription({
        originalDescription: existingDesc,
        keywords: selectedKeywords,
        marketplace,
        productName,
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to optimize description.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="md" className="border-[#E4E7EC] bg-white space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#E4E7EC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/15 border border-[#60A5FA]/30 text-[#1D4ED8] flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#101828]">
              03. Description Optimizer
            </h3>
            <p className="text-[11px] text-[#667085]">Enrich density & readability</p>
          </div>
        </div>
        <Button
          size="xs"
          variant="primary"
          onClick={handleOptimize}
          isLoading={isLoading}
          icon={<Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />}
        >
          {result ? 'Re-Optimize' : 'Optimize'}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1.5">
          Current Product Description
        </label>
        <textarea
          rows={3}
          value={existingDesc}
          onChange={(e) => setExistingDesc(e.target.value)}
          placeholder="Paste existing marketplace product description..."
          className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
        />
      </div>

      {result && (
        <div className="space-y-3.5 pt-3 border-t border-[#E4E7EC]">
          {/* Score comparison bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC]">
            <div className="flex items-center gap-3 font-mono tabular-nums">
              <div>
                <span className="text-[10px] text-[#667085] uppercase font-sans font-semibold block">Before</span>
                <span className="text-lg font-bold text-[#475467]">{result.currentScore}/100</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#98A2B3]" />
              <div>
                <span className="text-[10px] text-[#0F766E] uppercase font-sans font-semibold block">Optimized</span>
                <span className="text-xl font-bold text-[#0F766E]">{result.potentialScore}/100</span>
              </div>
            </div>

            {result.missingKeywords.length > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-amber-700 font-semibold uppercase block">Missing Terms</span>
                <span className="text-xs font-mono tabular-nums font-semibold text-[#101828]">
                  {result.missingKeywords.length} added
                </span>
              </div>
            )}
          </div>

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#475467] uppercase tracking-wider block">
                Improvements Applied
              </span>
              {result.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-[#475467] bg-[#F8FAFC] p-2 rounded-lg border border-[#E4E7EC]"
                >
                  <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Before / After */}
          <div className="space-y-2.5 pt-1">
            <div>
              <span className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider block mb-1">
                Optimized Copy
              </span>
              <div className="p-3 bg-[#14B8A6]/5 border border-[#14B8A6]/30 rounded-lg text-xs text-[#101828] leading-relaxed max-h-40 overflow-y-auto">
                {result.optimizedDescription}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button size="xs" variant="ghost" onClick={() => setResult(null)}>
              Reset
            </Button>
            {onApplyDescription && (
              <Button
                size="xs"
                variant="teal"
                onClick={() => {
                  setExistingDesc(result.optimizedDescription);
                  onApplyDescription(result.optimizedDescription);
                }}
              >
                Use Optimized Copy
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
