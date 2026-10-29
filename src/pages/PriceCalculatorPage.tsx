import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Sliders,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { SinglePriceCalculator } from '../features/price-calculator/components/SinglePriceCalculator';
import { BulkPriceCalculator } from '../features/price-calculator/components/BulkPriceCalculator';
import { PricingRulesManager } from '../features/price-calculator/components/PricingRulesManager';
import { PricingRule } from '../features/price-calculator/types';
import { priceCalculatorService } from '../features/price-calculator/services/priceCalculatorService';

export const PriceCalculatorPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'rules'>('single');
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await priceCalculatorService.getPricingRules();
      setRules(data);
    } catch (err) {
      console.error('Error loading rules:', err);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleCreateRule = async (ruleData: Partial<PricingRule>) => {
    await priceCalculatorService.createPricingRule(ruleData);
    await loadRules();
  };

  const handleUpdateRule = async (id: string, ruleData: Partial<PricingRule>) => {
    await priceCalculatorService.updatePricingRule(id, ruleData);
    await loadRules();
  };

  const handleDeleteRule = async (id: string) => {
    await priceCalculatorService.deletePricingRule(id);
    await loadRules();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">
            Price & Settlement Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Model marketplace commissions, inclusive GST slabs, shipping deductions, and net order profitability.
          </p>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg text-xs font-medium text-[#667085] border border-[#E4E7EC]">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'single'
                ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                : 'hover:text-[#101828]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Single SKU</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'bulk'
                ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                : 'hover:text-[#101828]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Bulk Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'rules'
                ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                : 'hover:text-[#101828]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>
              Fee Rules (<span className="font-mono tabular-nums">{rules.length}</span>)
            </span>
          </button>
        </div>
      </div>

      {/* Inline Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-xs ${
            notification.type === 'success'
              ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#101828]'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            className="text-[#667085] hover:text-[#101828] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'single' && (
        <SinglePriceCalculator
          onSaveAsRule={(data) => {
            setActiveTab('rules');
            handleCreateRule({
              name: 'Custom Calculator Rule',
              ...data,
            }).then(() => {
              showToast('success', 'Saved fee configuration to Pricing Rules.');
            });
          }}
        />
      )}

      {activeTab === 'bulk' && <BulkPriceCalculator rules={rules} onShowToast={showToast} />}

      {activeTab === 'rules' && (
        <PricingRulesManager
          rules={rules}
          onRefreshRules={loadRules}
          onCreateRule={handleCreateRule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          onShowToast={showToast}
        />
      )}
    </div>
  );
};
