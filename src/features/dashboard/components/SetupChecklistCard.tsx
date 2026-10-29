import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useSetupProgress } from '../hooks/useSetupProgress';
import { Button } from '../../../components/ui/Button';

export const SetupChecklistCard: React.FC = () => {
  const navigate = useNavigate();
  const { steps, completedCount, totalSteps, progressPercentage, allCompleted } = useSetupProgress();

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#101828]">Seller Setup Checklist</h3>
            <p className="text-xs text-[#667085] mt-0.5">
              Complete these steps to configure templates, listings, and companion autofill.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums font-semibold text-[#101828]">
            {completedCount}/{totalSteps} completed ({progressPercentage}%)
          </span>
        </div>

        <div className="w-full bg-[#F8FAFC] border border-[#E4E7EC] h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[#14B8A6] h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#E4E7EC] border border-[#E4E7EC] rounded-lg overflow-hidden">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              step.isCompleted ? 'bg-[#F8FAFC]/70' : 'bg-white hover:bg-[#F8FAFC]/50'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {step.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-[#667085] shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      step.isCompleted ? 'text-[#667085] line-through' : 'text-[#101828]'
                    }`}
                  >
                    {step.stepNumber}. {step.title}
                  </span>
                  {step.isCompleted && (
                    <span className="text-[11px] font-medium text-[#0F766E]">Completed</span>
                  )}
                </div>
                <p className="text-xs text-[#667085] mt-0.5 leading-snug">{step.description}</p>
              </div>
            </div>

            <Button
              variant={step.isCompleted ? 'outline' : 'primary'}
              size="xs"
              onClick={() => navigate(step.actionRoute)}
              className="shrink-0 self-start sm:self-center"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="p-3 bg-[#14B8A6]/10 border border-[#14B8A6]/25 rounded-lg text-xs font-medium text-[#0F766E]">
          All setup milestones completed. Your catalog workspace is configured for Meesho and bulk exports.
        </div>
      )}
    </div>
  );
};
