import React, { useEffect, useState } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { aiApiService } from '../services/aiApiService';
import { AIUsageSummary } from '../types/ai';

export const AIUsageBadge: React.FC = () => {
  const [summary, setSummary] = useState<AIUsageSummary | null>(null);

  useEffect(() => {
    aiApiService.getUsageSummary().then(setSummary).catch(console.error);
  }, []);

  if (!summary) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg px-3 py-1.5 text-xs text-[#101828]">
      <Sparkles className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
      {summary.isOwner ? (
        <span className="font-semibold text-[#101828] inline-flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Owner Unlimited</span>
        </span>
      ) : (
        <span className="text-[#667085]">
          <strong className="font-mono font-semibold tabular-nums text-[#101828]">
            {summary.remainingCredits}
          </strong>
          <span className="font-mono tabular-nums">/{summary.dailyLimit}</span> credits
        </span>
      )}
      <span className="text-[#D0D5DD]" aria-hidden="true">
        ·
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-[#667085]">
        {summary.plan.replace('_', ' ')}
      </span>
    </div>
  );
};
