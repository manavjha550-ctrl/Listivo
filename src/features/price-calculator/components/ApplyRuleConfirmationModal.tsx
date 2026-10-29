import React from 'react';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PricingRule } from '../types';

interface ApplyRuleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  rule: PricingRule | null;
  targetCount: number;
}

export const ApplyRuleConfirmationModal: React.FC<ApplyRuleConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rule,
  targetCount,
}) => {
  const [applying, setApplying] = React.useState<boolean>(false);

  if (!isOpen || !rule) return null;

  const handleApply = async () => {
    setApplying(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error applying rule:', err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/55 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E4E7EC] overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200">
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#101828]">
              Apply &ldquo;{rule.name}&rdquo; to{' '}
              <span className="font-mono tabular-nums">{targetCount}</span> Listing
              {targetCount !== 1 ? 's' : ''}?
            </h3>
            <p className="text-xs text-[#667085] mt-1">
              Batch recalculate fee deductions and settlement estimates using this schedule.
            </p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC] text-xs space-y-1.5 text-[#475467]">
            <div className="flex justify-between">
              <span className="text-[#667085]">GST Slab</span>
              <span className="font-mono font-semibold tabular-nums text-[#101828]">{rule.gstRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Packaging + Shipping</span>
              <span className="font-mono font-semibold tabular-nums text-[#101828]">
                ₹{rule.packagingCost + rule.shippingCost}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Marketplace Fee</span>
              <span className="font-mono font-semibold tabular-nums text-[#101828]">
                ₹{rule.marketplaceFee} + {rule.marketplaceFeePercent}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
            <strong>Safety Notice:</strong> Applying this rule updates fee estimations. Manually entered selling prices
            are preserved unless explicitly modified.
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E7EC]">
            <Button variant="outline" size="sm" onClick={onClose} disabled={applying}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply} isLoading={applying}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-[#14B8A6]" />
              Confirm & Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
