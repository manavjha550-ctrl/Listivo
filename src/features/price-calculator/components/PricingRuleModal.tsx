import React, { useState, useEffect } from 'react';
import { X, Save, Sliders } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PricingRule } from '../types';

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: Partial<PricingRule>) => Promise<void>;
  initialRule?: PricingRule | null;
  mode?: 'create' | 'edit' | 'duplicate';
}

export const PricingRuleModal: React.FC<PricingRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRule,
  mode = 'create',
}) => {
  const [name, setName] = useState<string>('');
  const [gstRate, setGstRate] = useState<number>(5);
  const [packagingCost, setPackagingCost] = useState<number>(15);
  const [shippingCost, setShippingCost] = useState<number>(65);
  const [marketplaceFee, setMarketplaceFee] = useState<number>(10);
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(12);
  const [targetMargin, setTargetMargin] = useState<number>(25);

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (initialRule) {
      setName(mode === 'duplicate' ? `${initialRule.name} (Copy)` : initialRule.name);
      setGstRate(initialRule.gstRate);
      setPackagingCost(initialRule.packagingCost);
      setShippingCost(initialRule.shippingCost);
      setMarketplaceFee(initialRule.marketplaceFee);
      setMarketplaceFeePercent(initialRule.marketplaceFeePercent);
      setTargetMargin(initialRule.targetMargin);
    } else {
      setName('');
      setGstRate(5);
      setPackagingCost(15);
      setShippingCost(65);
      setMarketplaceFee(10);
      setMarketplaceFeePercent(12);
      setTargetMargin(25);
    }
  }, [initialRule, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Rule name is required.');
      return;
    }

    if (
      gstRate < 0 ||
      packagingCost < 0 ||
      shippingCost < 0 ||
      marketplaceFee < 0 ||
      marketplaceFeePercent < 0 ||
      targetMargin < 0
    ) {
      setError('Pricing rule values cannot be negative.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        gstRate,
        packagingCost,
        shippingCost,
        marketplaceFee,
        marketplaceFeePercent,
        targetMargin,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save pricing rule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/55 backdrop-blur-[2px]">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E4E7EC] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1D2939] bg-[#101828] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#14B8A6]/15 border border-[#14B8A6]/30 text-[#14B8A6] rounded-lg flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {mode === 'edit'
                  ? 'Edit Fee Rule'
                  : mode === 'duplicate'
                  ? 'Duplicate Fee Rule'
                  : 'Create Fee Rule'}
              </h2>
              <p className="text-xs text-[#98A2B3]">
                Configure standard GST, logistics, and commission parameters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#98A2B3] hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#101828] mb-1">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Meesho Apparel 5% GST"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                GST Slab (%)
              </label>
              <Input
                type="number"
                min={0}
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                Target Margin (%)
              </label>
              <Input
                type="number"
                min={0}
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="25"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#475467] mb-1">
                Packaging Cost (₹)
              </label>
              <Input
                type="number"
                min={0}
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="15"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#475467] mb-1">
                Shipping Estimate (₹)
              </label>
              <Input
                type="number"
                min={0}
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="65"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#475467] mb-1">
                Fixed Fee (₹)
              </label>
              <Input
                type="number"
                min={0}
                value={marketplaceFee}
                onChange={(e) => setMarketplaceFee(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#475467] mb-1">
                Commission (%)
              </label>
              <Input
                type="number"
                min={0}
                value={marketplaceFeePercent}
                onChange={(e) => setMarketplaceFeePercent(Number(e.target.value))}
                className="font-mono tabular-nums"
                placeholder="12"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E4E7EC]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" isLoading={saving}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {mode === 'edit' ? 'Update Rule' : 'Save Rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
