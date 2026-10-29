import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BulkRow, ValidationSummary } from '../types/bulk';
import { STANDARD_LISTIVO_FIELDS } from '../services/standardFields';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Edit3,
  Wand2,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface SpreadsheetGridProps {
  rows: BulkRow[];
  summary: ValidationSummary;
  marketplace: string;
  onRowChange: (rowIndex: number, fieldKey: string, newValue: any) => void;
  onBulkEditRows: (selectedIndices: number[], fieldKey: string, newValue: any) => void;
  onOpenBulkEditModal?: (selectedIndices: number[]) => void;
  onAutoGenerateSkus: (selectedIndices: number[]) => void;
  onApplyToCatalog: (mode: 'create' | 'update' | 'upsert') => void;
  onOpenExportModal: () => void;
  onOpenBulkAIModal?: () => void;
  activeFilter: 'ALL' | 'ERROR' | 'WARNING' | 'VALID' | 'MODIFIED';
  onFilterChange: (filter: 'ALL' | 'ERROR' | 'WARNING' | 'VALID' | 'MODIFIED') => void;
  targetFocusCell?: { rowIndex: number; fieldKey: string } | null;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  rows,
  onRowChange,
  onOpenBulkEditModal,
  onAutoGenerateSkus,
  onApplyToCatalog,
  onOpenExportModal,
  onOpenBulkAIModal,
  activeFilter,
  targetFocusCell,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    fieldKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [applyMode, setApplyMode] = useState<'create' | 'update' | 'upsert'>('upsert');

  const cellInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (targetFocusCell) {
      setEditingCell(targetFocusCell);
      const row = rows.find((r) => r.rowIndex === targetFocusCell.rowIndex);
      if (row) {
        setEditValue(String(row.data[targetFocusCell.fieldKey] || ''));
      }
      const page = Math.floor(targetFocusCell.rowIndex / pageSize) + 1;
      setCurrentPage(page);
    }
  }, [targetFocusCell, rows, pageSize]);

  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [editingCell]);

  const filteredRows = rows.filter((r) => {
    if (activeFilter === 'ERROR' && r.status !== 'ERROR') return false;
    if (activeFilter === 'WARNING' && r.status !== 'WARNING') return false;
    if (activeFilter === 'VALID' && r.status !== 'VALID') return false;
    if (activeFilter === 'MODIFIED' && r.status !== 'MODIFIED') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const sku = String(r.data.sku || '').toLowerCase();
      const title = String(r.data.title || '').toLowerCase();
      const brand = String(r.data.brand || '').toLowerCase();
      return sku.includes(q) || title.includes(q) || brand.includes(q);
    }

    return true;
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleSelectAll = () => {
    if (selectedRowIndices.size === filteredRows.length) {
      setSelectedRowIndices(new Set());
    } else {
      setSelectedRowIndices(new Set(filteredRows.map((r) => r.rowIndex)));
    }
  };

  const handleToggleSelectRow = (rowIndex: number) => {
    const next = new Set(selectedRowIndices);
    if (next.has(rowIndex)) {
      next.delete(rowIndex);
    } else {
      next.add(rowIndex);
    }
    setSelectedRowIndices(next);
  };

  const startCellEdit = (rowIndex: number, fieldKey: string, currentValue: any) => {
    setEditingCell({ rowIndex, fieldKey });
    setEditValue(
      currentValue !== undefined && currentValue !== null ? String(currentValue) : ''
    );
  };

  const saveCellEdit = () => {
    if (!editingCell) return;
    onRowChange(editingCell.rowIndex, editingCell.fieldKey, editValue);
    setEditingCell(null);
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveCellEdit();
    } else if (e.key === 'Escape') {
      cancelCellEdit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E4E7EC] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg focus:bg-white focus:border-[#14B8A6] focus:outline-none text-[#101828]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <Link
            to="/image-maker"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E4E7EC] hover:border-[#14B8A6] text-[#101828] text-xs font-medium rounded-lg bg-white transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Image Workspace</span>
          </Link>

          {onOpenBulkAIModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />}
              onClick={onOpenBulkAIModal}
            >
              Bulk Smart Copy
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={onOpenExportModal}
          >
            Export CSV / XLSX
          </Button>

          <div className="flex items-center gap-1 border border-[#E4E7EC] bg-[#F8FAFC] rounded-lg p-1">
            <select
              value={applyMode}
              onChange={(e) => setApplyMode(e.target.value as any)}
              aria-label="Catalog commit mode"
              className="text-xs bg-transparent font-medium text-[#101828] focus:outline-none py-1 px-2 cursor-pointer"
            >
              <option value="upsert">Create &amp; Update (Upsert)</option>
              <option value="create">Create New Only</option>
              <option value="update">Update Existing Only</option>
            </select>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => onApplyToCatalog(applyMode)}
            >
              Commit to Listings
            </Button>
          </div>
        </div>
      </div>

      {/* Batch Selection Bar */}
      {selectedRowIndices.size > 0 && (
        <div className="bg-[#101828] text-white px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-medium flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#14B8A6] text-white font-mono tabular-nums font-bold">
              {selectedRowIndices.size}
            </span>
            <span>rows selected for batch actions</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenBulkEditModal && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => onOpenBulkEditModal(Array.from(selectedRowIndices))}
                className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                Bulk Edit Field
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="xs"
              icon={<Wand2 className="w-3.5 h-3.5" />}
              onClick={() => onAutoGenerateSkus(Array.from(selectedRowIndices))}
            >
              Auto-Generate SKUs
            </Button>

            <button
              type="button"
              onClick={() => setSelectedRowIndices(new Set())}
              className="text-xs text-slate-300 hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] sticky top-0 z-20">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center sticky left-0 z-30 bg-[#F8FAFC] border-r border-[#E4E7EC]">
                  <input
                    type="checkbox"
                    aria-label="Select all filtered rows"
                    checked={
                      selectedRowIndices.size === filteredRows.length &&
                      filteredRows.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2.5 w-12 text-center font-mono font-semibold text-[#667085] sticky left-10 z-30 bg-[#F8FAFC] border-r border-[#E4E7EC]">
                  #
                </th>
                <th className="px-3 py-2.5 w-24 text-center font-semibold text-[#667085] sticky left-22 z-30 bg-[#F8FAFC] border-r border-[#E4E7EC]">
                  Status
                </th>

                {STANDARD_LISTIVO_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    className="px-3 py-2.5 font-semibold text-[#101828] whitespace-nowrap min-w-[140px] border-r border-[#E4E7EC]"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#101828]">{field.label}</span>
                      <span className="text-[10px] font-mono font-normal text-[#667085]">
                        {field.key} {field.isRequired ? '*' : ''}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E7EC]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={STANDARD_LISTIVO_FIELDS.length + 3}
                    className="px-6 py-12 text-center text-[#667085] text-xs"
                  >
                    No catalog rows match your active filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isSelected = selectedRowIndices.has(row.rowIndex);

                  return (
                    <tr
                      key={row.id || row.rowIndex}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isSelected ? 'bg-[#14B8A6]/5' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-center sticky left-0 z-10 bg-white border-r border-[#E4E7EC]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(row.rowIndex)}
                          className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-2 text-center font-mono tabular-nums text-[11px] font-medium text-[#667085] sticky left-10 z-10 bg-white border-r border-[#E4E7EC]">
                        {row.rowIndex + 1}
                      </td>

                      <td className="px-3 py-2 text-center sticky left-22 z-10 bg-white border-r border-[#E4E7EC] whitespace-nowrap">
                        {row.status === 'VALID' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E]">
                            <CheckCircle2 className="w-3 h-3 text-[#14B8A6]" />
                            Valid
                          </span>
                        )}
                        {row.status === 'WARNING' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Warn
                          </span>
                        )}
                        {row.status === 'ERROR' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Error
                          </span>
                        )}
                        {row.status === 'MODIFIED' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB]">
                            <Edit3 className="w-3 h-3 text-[#60A5FA]" />
                            Edited
                          </span>
                        )}
                      </td>

                      {STANDARD_LISTIVO_FIELDS.map((field) => {
                        const val = row.data[field.key];
                        const err = row.errors.find((e) => e.field === field.key);
                        const isEditing =
                          editingCell?.rowIndex === row.rowIndex &&
                          editingCell?.fieldKey === field.key;

                        let cellClass = `border-r border-[#E4E7EC] px-3 py-2 text-[#101828] transition-colors relative cursor-pointer text-xs ${
                          field.type === 'number' || field.key === 'sku' || field.key === 'hsnCode'
                            ? 'font-mono tabular-nums'
                            : 'font-sans'
                        }`;

                        if (err) {
                          cellClass +=
                            err.severity === 'error'
                              ? ' bg-rose-50/80 hover:bg-rose-100/70 text-rose-950 font-medium'
                              : ' bg-amber-50/80 hover:bg-amber-100/70 text-amber-950 font-medium';
                        } else if (row.isModified) {
                          cellClass += ' bg-[#60A5FA]/5 font-medium';
                        }

                        return (
                          <td
                            key={field.key}
                            className={cellClass}
                            onClick={() =>
                              !isEditing && startCellEdit(row.rowIndex, field.key, val)
                            }
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                {field.type === 'dropdown' && field.options ? (
                                  <select
                                    ref={cellInputRef as any}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={handleKeyDown}
                                    className="w-full text-xs border-2 border-[#14B8A6] rounded px-1.5 py-1 bg-white focus:outline-none"
                                  >
                                    <option value="">Select...</option>
                                    {field.options.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    ref={cellInputRef as any}
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={saveCellEdit}
                                    onKeyDown={handleKeyDown}
                                    className="w-full text-xs border-2 border-[#14B8A6] rounded px-1.5 py-1 bg-white focus:outline-none"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1.5 min-h-[20px]">
                                <span className="truncate max-w-[200px]">
                                  {val !== undefined &&
                                  val !== null &&
                                  String(val).trim() !== '' ? (
                                    String(val)
                                  ) : (
                                    <span className="text-slate-300 italic font-sans">Empty</span>
                                  )}
                                </span>

                                {err && (
                                  <span
                                    title={err.message}
                                    className="shrink-0"
                                  >
                                    {err.severity === 'error' ? (
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    ) : (
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <div className="flex items-center gap-3">
            <span className="font-mono tabular-nums">
              Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} rows
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="text-xs border border-[#E4E7EC] rounded-md px-2 py-1 bg-white text-[#101828]"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-[#E4E7EC] bg-white rounded-md hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono tabular-nums font-semibold text-[#101828]">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-[#E4E7EC] bg-white rounded-md hover:bg-[#F8FAFC] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
