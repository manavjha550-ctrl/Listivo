import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckSquare,
  Square,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BulkCalculatorItem, BulkCalculatedResultItem, PricingRule } from '../types';
import { priceCalculatorService } from '../services/priceCalculatorService';

interface BulkPriceCalculatorProps {
  rules: PricingRule[];
  onShowToast?: (type: 'success' | 'error', message: string) => void;
}

export const BulkPriceCalculator: React.FC<BulkPriceCalculatorProps> = ({ rules, onShowToast }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<BulkCalculatorItem[]>([]);
  const [calculatedResults, setCalculatedResults] = useState<BulkCalculatedResultItem[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>(rules[0]?.id || '');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROFITABLE' | 'LOW_MARGIN' | 'LOSS_MAKING'>('ALL');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mappedItems: BulkCalculatorItem[] = json.data.map((p: any) => ({
          id: p.id,
          title: p.title || 'Untitled Listing',
          sku: p.sku || 'SKU-NONE',
          costPrice: Number(p.costPrice) || Math.round((Number(p.sellingPrice) || 500) * 0.5),
          sellingPrice: Number(p.sellingPrice) || 0,
          mrp: Number(p.mrp) || Number(p.sellingPrice) || 0,
          gstRate: Number(p.gstRate) || 5,
        }));
        setItems(mappedItems);
        setSelectedIndices(new Set(mappedItems.map((_, idx) => idx)));
        runBulkCalculation(mappedItems, selectedRuleId);
      }
    } catch (err) {
      console.error('Failed to load catalog products for bulk calculator:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBulkCalculation = async (targetItems: BulkCalculatorItem[], ruleId: string) => {
    setLoading(true);
    try {
      const activeRule = rules.find((r) => r.id === ruleId) || rules[0];
      const res = await priceCalculatorService.calculateBulkPrices(targetItems, ruleId, activeRule);
      setCalculatedResults(res);
      if (onShowToast) {
        onShowToast('success', `Calculated settlements for ${res.length} catalog SKUs.`);
      }
    } catch (err) {
      console.error('Bulk calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRuleId = e.target.value;
    setSelectedRuleId(newRuleId);
    runBulkCalculation(items, newRuleId);
  };

  const handleItemChange = (index: number, field: 'costPrice' | 'sellingPrice' | 'mrp', val: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, val),
    };
    setItems(updated);
    runBulkCalculation(updated, selectedRuleId);
  };

  const filteredResults = calculatedResults.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIndices.size === filteredResults.length) {
      setSelectedIndices(new Set());
    } else {
      const newSet = new Set<number>();
      filteredResults.forEach((_, idx) => newSet.add(idx));
      setSelectedIndices(newSet);
    }
  };

  const toggleSelectItem = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = (format: 'csv' | 'xlsx') => {
    const exportData = filteredResults.map((row) => ({
      'Product Title': row.title,
      SKU: row.sku,
      'Cost Price (₹)': row.costPrice,
      'Selling Price (₹)': row.sellingPrice,
      'MRP (₹)': row.mrp,
      'GST Rate (%)': row.gstRate,
      'Marketplace Fee (₹)': row.details.marketplaceFee,
      'Packaging + Shipping (₹)': row.details.packagingCost + row.details.shippingCost,
      'Total Expense (₹)': row.details.totalCost,
      'Est. Settlement (₹)': row.estimatedSettlement,
      'Est. Net Profit (₹)': row.estimatedProfit,
      'Profit Margin (%)': row.profitMarginPercent,
      'Break-even Price (₹)': row.breakEvenSellingPrice,
      Status: row.status,
    }));

    const filename = `Listivo_Bulk_Price_Calculation_${Date.now()}.${format}`;

    if (format === 'csv') {
      const csvStr = Papa.unparse(exportData);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bulk Pricing');
      XLSX.writeFile(wb, filename);
    }

    if (onShowToast) {
      onShowToast('success', `Exported ${exportData.length} records to ${format.toUpperCase()}.`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E4E7EC]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#667085]">Rule:</span>
            <select
              value={selectedRuleId}
              onChange={handleRuleChange}
              className="px-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg font-medium text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="">Default Fee Schedule</option>
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (GST {r.gstRate}%, Fee {r.marketplaceFeePercent}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E4E7EC] text-xs font-medium text-[#667085]">
            {[
              { id: 'ALL', label: `All (${calculatedResults.length})` },
              { id: 'PROFITABLE', label: 'Profitable' },
              { id: 'LOW_MARGIN', label: 'Low Margin' },
              { id: 'LOSS_MAKING', label: 'Loss' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#101828] shadow-2xs font-semibold border border-[#E4E7EC]/60'
                    : 'hover:text-[#101828]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runBulkCalculation(items, selectedRuleId)}
            isLoading={loading}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Recalculate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={filteredResults.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#0F766E]" />
            CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExport('xlsx')}
            disabled={filteredResults.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            XLSX
          </Button>
        </div>
      </div>

      {/* Bulk Table Card */}
      <Card padding="none" className="border-[#E4E7EC] bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E4E7EC] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#101828]">Catalog Settlement & Margin Matrix</h3>
          <span className="text-xs font-mono tabular-nums text-[#667085]">
            {filteredResults.length} SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E4E7EC] text-[11px] font-semibold text-[#475467] uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label="Toggle select all rows"
                    className="text-[#667085] hover:text-[#101828]"
                  >
                    {selectedIndices.size === filteredResults.length && filteredResults.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#0F766E]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#98A2B3]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Product Title & SKU</th>
                <th className="py-3 px-4 w-28">Cost (₹)</th>
                <th className="py-3 px-4 w-28">Selling (₹)</th>
                <th className="py-3 px-4 w-28 text-right">Settlement</th>
                <th className="py-3 px-4 w-28 text-right">Net Profit</th>
                <th className="py-3 px-4 w-24 text-right">Margin</th>
                <th className="py-3 px-4 w-28">Health</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E7EC] text-xs text-[#101828]">
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#667085]">
                    No catalog SKUs match your current filter.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx;
                  const itemSrcIdx = items.findIndex((i) => i.id === row.productId);

                  return (
                    <tr key={row.productId} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectItem(globalIdx)}
                          aria-label={`Select ${row.title}`}
                          className="text-[#667085] hover:text-[#101828]"
                        >
                          {selectedIndices.has(globalIdx) ? (
                            <CheckSquare className="w-4 h-4 text-[#0F766E]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#D0D5DD]" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#101828] truncate max-w-xs" title={row.title}>
                          {row.title}
                        </div>
                        <div className="text-[11px] text-[#667085] font-mono tabular-nums mt-0.5">
                          {row.sku}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          value={row.costPrice}
                          onChange={(e) =>
                            itemSrcIdx >= 0 && handleItemChange(itemSrcIdx, 'costPrice', Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 bg-[#F8FAFC] border border-[#D0D5DD] rounded text-xs font-mono font-semibold tabular-nums focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min={0}
                          value={row.sellingPrice}
                          onChange={(e) =>
                            itemSrcIdx >= 0 && handleItemChange(itemSrcIdx, 'sellingPrice', Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 bg-[#F8FAFC] border border-[#D0D5DD] rounded text-xs font-mono font-semibold tabular-nums focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                        />
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-[#101828]">
                        ₹{row.estimatedSettlement.toFixed(2)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold tabular-nums ${
                          row.estimatedProfit >= 0 ? 'text-[#0F766E]' : 'text-rose-700'
                        }`}
                      >
                        {row.estimatedProfit < 0 ? '-' : ''}₹{Math.abs(row.estimatedProfit).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-[#101828]">
                        {row.profitMarginPercent.toFixed(1)}%
                      </td>

                      <td className="py-3 px-4">
                        {row.status === 'PROFITABLE' && (
                          <span className="text-[11px] font-semibold text-[#0F766E]">Profitable</span>
                        )}
                        {row.status === 'LOW_MARGIN' && (
                          <span className="text-[11px] font-semibold text-amber-700">Low Margin</span>
                        )}
                        {row.status === 'LOSS_MAKING' && (
                          <span className="text-[11px] font-semibold text-rose-700">Loss</span>
                        )}
                        {row.status === 'INVALID' && (
                          <span className="text-[11px] font-medium text-[#667085]">Invalid</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
          <div className="font-mono tabular-nums">
            Showing {filteredResults.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Prev
            </Button>
            <span className="font-mono tabular-nums font-medium text-[#101828]">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="xs"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
