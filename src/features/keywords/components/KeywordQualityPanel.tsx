import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { KeywordQualityAnalysis } from '../types/keywordTypes';

interface KeywordQualityPanelProps {
  analysis: KeywordQualityAnalysis | null;
  isLoading?: boolean;
}

export const KeywordQualityPanel: React.FC<KeywordQualityPanelProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <Card padding="md" className="border-[#E4E7EC] bg-[#F8FAFC] text-center">
        <p className="text-xs text-[#667085]">Run keyword discovery to inspect search quality signals.</p>
      </Card>
    );
  }

  const getToneClass = (value: 'HIGH' | 'MEDIUM' | 'LOW', isRiskField = false) => {
    if (isRiskField) {
      if (value === 'HIGH') return 'text-rose-700 font-semibold';
      if (value === 'MEDIUM') return 'text-amber-700 font-semibold';
      return 'text-[#0F766E] font-semibold';
    }
    if (value === 'HIGH') return 'text-[#0F766E] font-semibold';
    if (value === 'MEDIUM') return 'text-amber-700 font-semibold';
    return 'text-[#667085] font-medium';
  };

  const signals: Array<{ label: string; value: 'HIGH' | 'MEDIUM' | 'LOW'; risk?: boolean }> = [
    { label: 'Relevance', value: analysis.relevance },
    { label: 'Specificity', value: analysis.specificity },
    { label: 'Buying Intent', value: analysis.commercialIntent },
    { label: 'Attribute Coverage', value: analysis.attributeCoverage },
    { label: 'Duplication Risk', value: analysis.duplicationRisk, risk: true },
    { label: 'Stuffing Risk', value: analysis.keywordStuffingRisk, risk: true },
  ];

  return (
    <Card padding="md" className="border-[#E4E7EC] space-y-4 bg-white">
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] text-[#101828] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#101828]">Quality Signal Audit</h3>
            <p className="text-[11px] text-[#667085]">Search index health score</p>
          </div>
        </div>
        <div className="text-right font-mono tabular-nums">
          <span className="text-2xl font-bold text-[#101828]">{analysis.score}</span>
          <span className="text-[11px] text-[#667085] block">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {signals.map((sig) => (
          <div
            key={sig.label}
            className="px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-between gap-2"
          >
            <span className="text-[#667085] truncate">{sig.label}</span>
            <span className={`text-[11px] uppercase tracking-wide ${getToneClass(sig.value, sig.risk)}`}>
              {sig.value}
            </span>
          </div>
        ))}
      </div>

      {analysis.keywordStuffingRisk === 'HIGH' && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            High keyword repetition detected. Trim overlapping phrases before building marketplace titles.
          </p>
        </div>
      )}
    </Card>
  );
};
