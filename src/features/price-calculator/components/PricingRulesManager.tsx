import React, { useState } from 'react';
import { Plus, Sliders, Copy, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PricingRule } from '../types';
import { PricingRuleModal } from './PricingRuleModal';
import { ApplyRuleConfirmationModal } from './ApplyRuleConfirmationModal';

interface PricingRulesManagerProps {
  rules: PricingRule[];
  onRefreshRules: () => void;
  onCreateRule: (rule: Partial<PricingRule>) => Promise<void>;
  onUpdateRule: (id: string, rule: Partial<PricingRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onShowToast?: (type: 'success' | 'error', message: string) => void;
}

export const PricingRulesManager: React.FC<PricingRulesManagerProps> = ({
  rules,
  onRefreshRules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onShowToast,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [confirmApplyOpen, setConfirmApplyOpen] = useState<boolean>(false);
  const [ruleToApply, setRuleToApply] = useState<PricingRule | null>(null);

  const handleOpenCreate = () => {
    setSelectedRule(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (rule: PricingRule) => {
    setSelectedRule(rule);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleOpenDuplicate = (rule: PricingRule) => {
    setSelectedRule(rule);
    setModalMode('duplicate');
    setModalOpen(true);
  };

  const handleDelete = async (rule: PricingRule) => {
    try {
      await onDeleteRule(rule.id);
      setConfirmDeleteId(null);
      if (onShowToast) onShowToast('success', `Deleted pricing rule "${rule.name}".`);
      onRefreshRules();
    } catch (err: any) {
      if (onShowToast) onShowToast('error', err.message || 'Failed to delete rule.');
    }
  };

  const handleOpenApply = (rule: PricingRule) => {
    setRuleToApply(rule);
    setConfirmApplyOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!ruleToApply) return;
    try {
      if (onShowToast) {
        onShowToast('success', `Applied rule "${ruleToApply.name}" to catalog fee calculations.`);
      }
    } catch (err) {
      console.error('Error applying rule:', err);
    }
  };

  const handleSaveModal = async (ruleData: Partial<PricingRule>) => {
    if (modalMode === 'edit' && selectedRule) {
      await onUpdateRule(selectedRule.id, ruleData);
      if (onShowToast) onShowToast('success', `Updated pricing rule "${ruleData.name}".`);
    } else {
      await onCreateRule(ruleData);
      if (onShowToast) onShowToast('success', `Created pricing rule "${ruleData.name}".`);
    }
    onRefreshRules();
  };

  return (
    <div className="space-y-4">
      <Card padding="none" className="border-[#E4E7EC] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E4E7EC] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#101828] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0F766E]" />
              <span>Saved Fee Rules & Margin Profiles</span>
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Reusable GST, logistics, and commission schedules for bulk settlement modeling.
            </p>
          </div>

          <Button variant="teal" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Fee Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-sm font-semibold text-[#101828]">No fee rules saved yet</p>
            <p className="text-xs text-[#667085] mt-1">
              Click New Fee Rule to create a reusable marketplace commission and shipping schedule.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] text-[#475467] font-semibold uppercase tracking-wider border-b border-[#E4E7EC]">
                <tr>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4 text-right">GST Slab</th>
                  <th className="py-3 px-4 text-right">Packaging</th>
                  <th className="py-3 px-4 text-right">Shipping</th>
                  <th className="py-3 px-4 text-right">Marketplace Fee</th>
                  <th className="py-3 px-4 text-right">Target Margin</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] text-[#101828]">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#101828]">{rule.name}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#475467]">
                      {rule.gstRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#475467]">
                      ₹{rule.packagingCost}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#475467]">
                      ₹{rule.shippingCost}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#101828] font-medium">
                      ₹{rule.marketplaceFee} + {rule.marketplaceFeePercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#0F766E]">
                      {rule.targetMargin}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      {confirmDeleteId === rule.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Button size="xs" variant="danger" onClick={() => handleDelete(rule)}>
                            Confirm
                          </Button>
                          <Button size="xs" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button size="xs" variant="outline" onClick={() => handleOpenApply(rule)}>
                            Apply
                          </Button>
                          <button
                            type="button"
                            onClick={() => handleOpenDuplicate(rule)}
                            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                            title="Duplicate Rule"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rule)}
                            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(rule.id)}
                            className="p-1.5 text-[#667085] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PricingRuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
        initialRule={selectedRule}
        mode={modalMode}
      />

      <ApplyRuleConfirmationModal
        isOpen={confirmApplyOpen}
        onClose={() => setConfirmApplyOpen(false)}
        onConfirm={handleConfirmApply}
        rule={ruleToApply}
        targetCount={25}
      />
    </div>
  );
};
