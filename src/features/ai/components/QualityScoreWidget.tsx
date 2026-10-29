import React from 'react';
import { ShieldCheck, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AIQualityScore } from '../types/ai';

interface QualityScoreWidgetProps {
  score: AIQualityScore | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
}

export const QualityScoreWidget: React.FC<QualityScoreWidgetProps> = ({
  score,
  isLoading = false,
  onRefresh,
  compact = false,
}) => {
  if (!score) {
    return (
      <Card className="p-4 bg-[#F8FAFC] border-dashed border-[#D0D5DD] text-center">
        <p className="text-xs text-[#667085] mb-2.5">Listing quality audit has not been run yet.</p>
        {onRefresh && (
          <Button size="xs" variant="secondary" onClick={onRefresh} isLoading={isLoading}>
            <RefreshCw className="w-3 h-3 mr-1.5" /> Analyze Listing Quality
          </Button>
        )}
      </Card>
    );
  }

  const getScoreTone = (val: number) => {
    if (val >= 85) return 'text-[#0F766E]';
    if (val >= 65) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getScoreLabel = (val: number) => {
    if (val >= 85) return 'Marketplace Ready';
    if (val >= 65) return 'Good Baseline';
    return 'Needs Refinement';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E4E7EC] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center font-mono font-bold tabular-nums text-sm text-[#101828]">
            {score.overallScore}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#101828] flex items-center gap-1.5">
              <span>Catalog Score</span>
              <span className="text-[#D0D5DD]" aria-hidden="true">·</span>
              <span className={`font-medium ${getScoreTone(score.overallScore)}`}>
                {getScoreLabel(score.overallScore)}
              </span>
            </div>
            <p className="text-[11px] text-[#667085] mt-0.5">
              <span className="font-mono tabular-nums">{score.suggestions.length}</span> optimization recommendations
            </p>
          </div>
        </div>
        {onRefresh && (
          <Button size="xs" variant="ghost" onClick={onRefresh} isLoading={isLoading} aria-label="Re-analyze quality">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    );
  }

  const metrics = [
    { label: 'Title Clarity', value: score.titleScore },
    { label: 'Description Depth', value: score.descriptionScore },
    { label: 'Search Terms', value: score.keywordScore },
    { label: 'Policy Compliance', value: score.complianceScore },
  ];

  return (
    <Card className="p-5 space-y-4 border-[#E4E7EC] bg-white">
      <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          <h3 className="font-semibold text-sm text-[#101828]">Catalog Quality Audit</h3>
        </div>
        {onRefresh && (
          <Button size="xs" variant="outline" onClick={onRefresh} isLoading={isLoading}>
            <RefreshCw className="w-3 h-3 mr-1.5" /> Re-Analyze
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E4E7EC]">
        <div className="text-center sm:text-left flex flex-col items-center sm:items-start shrink-0">
          <span className="text-[11px] text-[#667085] font-semibold uppercase tracking-wider">Overall Score</span>
          <div className="flex items-baseline gap-1 mt-1 font-mono tabular-nums">
            <span className="text-3xl font-bold text-[#101828]">{score.overallScore}</span>
            <span className="text-xs text-[#667085] font-medium">/100</span>
          </div>
          <span className={`text-xs font-semibold mt-1 ${getScoreTone(score.overallScore)}`}>
            {getScoreLabel(score.overallScore)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs flex-1 w-full border-t sm:border-t-0 sm:border-l border-[#E4E7EC] sm:pl-6 pt-3 sm:pt-0">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-[#475467] mb-1">
                <span>{metric.label}</span>
                <span className="font-mono font-semibold tabular-nums text-[#101828]">{metric.value}%</span>
              </div>
              <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#14B8A6] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {score.suggestions && score.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#101828] flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Optimization Recommendations</span>
          </h4>
          <ul className="space-y-1.5">
            {score.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="text-xs text-[#475467] bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg px-3 py-2 flex items-start gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
