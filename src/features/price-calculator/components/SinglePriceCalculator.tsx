import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertCircle,
  RefreshCw,
  BookmarkPlus,
  Info,
  Sliders,
  Target,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PricingCalculationInput, PricingCalculationResult } from '../types';
import { priceCalculatorService } from '../services/priceCalculatorService';

interface SinglePriceCalculatorProps {
  onSaveAsRule?: (data: {
    gstRate: number;
    packagingCost: number;
    shippingCost: number;
    marketplaceFee: number;
    marketplaceFeePercent: number;
    targetMargin: number;
  }) => void;
}

export const SinglePriceCalculator: React.FC<SinglePriceCalculatorProps> = ({ onSaveAsRule }) => {
  const [productCost, setProductCost] = useState<number>(250);
  const [sellingPrice, setSellingPrice] = useState<number>(599);
  const [mrp, setMrp] = useState<number>(999);
  const [gstRate, setGstRate] = useState<number>(5);
  const [packagingCost, setPackagingCost] = useState<number>(15);
  const [shippingCost, setShippingCost] = useState<number>(65);
  const [marketplaceFee, setMarketplaceFee] = useState<number>(10);
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(12);
  const [otherExpenses, setOtherExpenses] = useState<number>(10);

  const [selectedPreset, setSelectedPreset] = useState<'meesho' | 'flipkart' | 'amazon' | 'custom'>('custom');
  const [targetMode, setTargetMode] = useState<'amount' | 'margin'>('margin');
  const [targetValue, setTargetValue] = useState<number>(25);

  const [results, setResults] = useState<PricingCalculationResult | null>(null);

  useEffect(() => {
    const inputData: PricingCalculationInput = {
      productCost: Math.max(0, Number(productCost) || 0),
      sellingPrice: Math.max(0, Number(sellingPrice) || 0),
      mrp: Math.max(Number(sellingPrice) || 0, Number(mrp) || 0),
      gstRate: Math.max(0, Number(gstRate) || 0),
      packagingCost: Math.max(0, Number(packagingCost) || 0),
      shippingCost: Math.max(0, Number(shippingCost) || 0),
      marketplaceFee: Math.max(0, Number(marketplaceFee) || 0),
      marketplaceFeePercent: Math.max(0, Number(marketplaceFeePercent) || 0),
      otherExpenses: Math.max(0, Number(otherExpenses) || 0),
      targetProfitAmount: targetMode === 'amount' ? Math.max(0, Number(targetValue) || 0) : undefined,
      targetProfitMarginPercent: targetMode === 'margin' ? Math.max(0, Number(targetValue) || 0) : undefined,
    };

    const res = priceCalculatorService.calculateLocally(inputData);
    setResults(res);
  }, [
    productCost,
    sellingPrice,
    mrp,
    gstRate,
    packagingCost,
    shippingCost,
    marketplaceFee,
    marketplaceFeePercent,
    otherExpenses,
    targetMode,
    targetValue,
  ]);

  const applyPreset = (preset: 'meesho' | 'flipkart' | 'amazon') => {
    setSelectedPreset(preset);
    if (preset === 'meesho') {
      setMarketplaceFee(0);
      setMarketplaceFeePercent(0);
      setShippingCost(65);
      setGstRate(5);
      setPackagingCost(15);
    } else if (preset === 'flipkart') {
      setMarketplaceFee(10);
      setMarketplaceFeePercent(12);
      setShippingCost(60);
      setGstRate(5);
      setPackagingCost(15);
    } else if (preset === 'amazon') {
      setMarketplaceFee(15);
      setMarketplaceFeePercent(15);
      setShippingCost(70);
      setGstRate(12);
      setPackagingCost(20);
    }
  };

  const handleReset = () => {
    setProductCost(250);
    setSellingPrice(599);
    setMrp(999);
    setGstRate(5);
    setPackagingCost(15);
    setShippingCost(65);
    setMarketplaceFee(10);
    setMarketplaceFeePercent(12);
    setOtherExpenses(10);
    setSelectedPreset('custom');
    setTargetMode('margin');
    setTargetValue(25);
  };

  const warnings: string[] = [];
  if (productCost <= 0) warnings.push('Product cost must be greater than ₹0.');
  if (sellingPrice <= 0) warnings.push('Selling price must be greater than ₹0.');
  if (mrp < sellingPrice) warnings.push('MRP cannot be lower than the selling price.');
  if (results && results.estimatedProfit < 0) warnings.push('Current selling price results in a net loss per unit.');

  return (
    <div className="space-y-6">
      {/* Top Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E4E7EC]">
        <div>
          <h2 className="text-sm font-semibold text-[#101828] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0F766E]" />
            <span>Marketplace Fee Presets</span>
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Load standard commission and logistics profiles or configure custom rates below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['meesho', 'flipkart', 'amazon'] as const).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors ${
                selectedPreset === preset
                  ? 'bg-[#101828] border-[#101828] text-white'
                  : 'bg-[#F8FAFC] border-[#E4E7EC] text-[#475467] hover:bg-white hover:text-[#101828]'
              }`}
            >
              {preset === 'amazon' ? 'Amazon IN' : preset} Preset
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={handleReset} title="Reset calculator">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid: Inputs + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Order & Cost Inputs" className="border-[#E4E7EC]">
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                    Sourcing Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={productCost}
                    onChange={(e) => {
                      setProductCost(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="font-mono tabular-nums"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                    Selling Price (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => {
                      setSellingPrice(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="font-mono tabular-nums"
                    placeholder="599"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                    MRP (₹)
                  </label>
                  <Input
                    type="number"
                    min={sellingPrice}
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="font-mono tabular-nums"
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                    GST Slab (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={gstRate}
                    onChange={(e) => {
                      setGstRate(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="font-mono tabular-nums"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E7EC]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-2.5">
                  Logistics & Marketplace Deductions
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#475467] mb-1">
                      Packaging (₹)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={packagingCost}
                      onChange={(e) => {
                        setPackagingCost(Number(e.target.value));
                        setSelectedPreset('custom');
                      }}
                      className="font-mono tabular-nums"
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#475467] mb-1">
                      Shipping (₹)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={shippingCost}
                      onChange={(e) => {
                        setShippingCost(Number(e.target.value));
                        setSelectedPreset('custom');
                      }}
                      className="font-mono tabular-nums"
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#475467] mb-1">
                    Fixed Closing Fee (₹)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={marketplaceFee}
                    onChange={(e) => {
                      setMarketplaceFee(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
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
                    onChange={(e) => {
                      setMarketplaceFeePercent(Number(e.target.value));
                      setSelectedPreset('custom');
                    }}
                    className="font-mono tabular-nums"
                    placeholder="12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#475467] mb-1">
                  Return / Overhead Buffer (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(Number(e.target.value))}
                  className="font-mono tabular-nums"
                  placeholder="10"
                />
              </div>

              {onSaveAsRule && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() =>
                      onSaveAsRule({
                        gstRate,
                        packagingCost,
                        shippingCost,
                        marketplaceFee,
                        marketplaceFeePercent,
                        targetMargin: results?.profitMarginPercent || 20,
                      })
                    }
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-[#0F766E] mr-1.5" />
                    Save as Reusable Fee Rule
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {warnings.length > 0 && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Margin Validation Notices</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Calculation Breakdown Panel */}
        <div className="lg:col-span-7 space-y-4">
          {results && (
            <>
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-white rounded-xl border border-[#E4E7EC]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                    Bank Settlement
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#101828] mt-1.5">
                    ₹{results.estimatedSettlement.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-[#667085] mt-1">Net payout after GST & fees</p>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    results.estimatedProfit >= 0
                      ? 'bg-[#14B8A6]/5 border-[#14B8A6]/30'
                      : 'bg-rose-50/70 border-rose-200'
                  }`}
                >
                  <div
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      results.estimatedProfit >= 0 ? 'text-[#0F766E]' : 'text-rose-700'
                    }`}
                  >
                    Net Unit Profit
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${
                      results.estimatedProfit >= 0 ? 'text-[#0F766E]' : 'text-rose-700'
                    }`}
                  >
                    {results.estimatedProfit < 0 ? '-' : ''}₹{Math.abs(results.estimatedProfit).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-[#667085] mt-1">
                    {results.estimatedProfit >= 0 ? 'Positive unit economics' : 'Loss per dispatched unit'}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#E4E7EC]">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                    Net Margin
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${
                      results.profitMarginPercent >= 15
                        ? 'text-[#101828]'
                        : results.profitMarginPercent > 0
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {results.profitMarginPercent.toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-[#667085] mt-1">Share of listing selling price</p>
                </div>
              </div>

              {/* Comprehensive Itemized Expense Breakdown */}
              <Card title="Itemized Ledger Breakdown" className="border-[#E4E7EC]">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                    <span className="text-[#667085]">Maximum Retail Price (MRP)</span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      ₹{results.mrp.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                    <span className="text-[#667085]">
                      Customer Discount (<span className="font-mono tabular-nums">{results.discountPercent.toFixed(1)}%</span>)
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-amber-700">
                      -₹{results.discountAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC] font-semibold">
                    <span className="text-[#101828]">Listing Selling Price</span>
                    <span className="font-mono font-bold tabular-nums text-[#101828]">
                      ₹{results.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                    <span className="text-[#667085]">
                      Inclusive GST (<span className="font-mono tabular-nums">{results.gstRate}%</span>)
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      ₹{results.gstAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                    <span className="text-[#667085]">Marketplace Fee (Fixed + Commission)</span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      ₹{results.marketplaceFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                    <span className="text-[#667085]">Packaging + Outbound Shipping</span>
                    <span className="font-mono font-semibold tabular-nums text-[#101828]">
                      ₹{(results.packagingCost + results.shippingCost).toFixed(2)}
                    </span>
                  </div>

                  {results.otherExpenses > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-[#E4E7EC]">
                      <span className="text-[#667085]">Return & Overhead Buffer</span>
                      <span className="font-mono font-semibold tabular-nums text-[#101828]">
                        ₹{results.otherExpenses.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2.5 bg-[#F8FAFC] px-3.5 rounded-lg font-semibold text-[#101828] border border-[#E4E7EC]">
                    <span>Total Landed Unit Cost & Deductions</span>
                    <span className="font-mono tabular-nums">₹{results.totalCost.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between py-2.5 bg-[#101828] px-3.5 rounded-lg font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span>Break-Even Selling Price</span>
                    </span>
                    <span className="font-mono tabular-nums text-[#14B8A6]">
                      ₹{results.breakEvenSellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-[#667085] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#98A2B3]" />
                  <span>
                    GST is computed inclusive of selling price: (SP × GST) / (100 + GST).
                  </span>
                </div>
              </Card>

              {/* Target Profit Section */}
              <Card title="Reverse Target Price Solver" className="border-[#E4E7EC]">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E4E7EC]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#101828]">
                      <Target className="w-4 h-4 text-[#0F766E]" />
                      <span>Solve For Target Goal</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMode('margin');
                          setTargetValue(25);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          targetMode === 'margin'
                            ? 'bg-[#101828] text-white font-semibold'
                            : 'bg-white text-[#667085] border border-[#E4E7EC] hover:text-[#101828]'
                        }`}
                      >
                        Margin (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMode('amount');
                          setTargetValue(150);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                          targetMode === 'amount'
                            ? 'bg-[#101828] text-white font-semibold'
                            : 'bg-white text-[#667085] border border-[#E4E7EC] hover:text-[#101828]'
                        }`}
                      >
                        Profit (₹)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#475467] uppercase tracking-wider mb-1">
                        {targetMode === 'margin' ? 'Target Net Margin (%)' : 'Target Net Profit (₹)'}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={targetValue}
                        onChange={(e) => setTargetValue(Number(e.target.value))}
                        className="font-mono tabular-nums"
                        placeholder={targetMode === 'margin' ? '25' : '150'}
                      />
                    </div>

                    {results.targetCalculations && (
                      <div className="p-3.5 bg-[#14B8A6]/10 rounded-xl border border-[#14B8A6]/30 space-y-0.5 text-xs">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#0F766E]">
                          Required Selling Price
                        </div>
                        <div className="text-xl font-bold font-mono tabular-nums text-[#101828]">
                          ₹{results.targetCalculations.requiredSellingPrice.toFixed(2)}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-[#475467]">
                          {results.targetCalculations.differenceFromCurrent >= 0
                            ? `+₹${results.targetCalculations.differenceFromCurrent.toFixed(2)} vs current SP`
                            : `-₹${Math.abs(results.targetCalculations.differenceFromCurrent).toFixed(2)} vs current SP`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
