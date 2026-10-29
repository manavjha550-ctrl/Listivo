import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  History,
  ArrowLeft,
} from 'lucide-react';
import { FileDropzone } from '../features/bulk/components/FileDropzone';
import { ColumnMappingStep } from '../features/bulk/components/ColumnMappingStep';
import { TemplateSelectStep } from '../features/bulk/components/TemplateSelectStep';
import { SpreadsheetGrid } from '../features/bulk/components/SpreadsheetGrid';
import { ErrorSummaryPanel } from '../features/bulk/components/ErrorSummaryPanel';
import { BulkEditModal } from '../features/bulk/components/BulkEditModal';
import { BulkExportModal } from '../features/bulk/components/BulkExportModal';
import { ImportHistoryTable } from '../features/bulk/components/ImportHistoryTable';
import { BulkAIGenerateModal } from '../features/ai/components/BulkAIGenerateModal';

import { bulkParserService, ParseResult } from '../features/bulk/services/bulkParserService';
import { columnMappingService } from '../features/bulk/services/columnMappingService';
import { validationEngine } from '../features/bulk/services/validationEngine';
import { exportService } from '../features/bulk/services/exportService';
import { bulkApiService } from '../features/bulk/services/bulkApiService';

import {
  BulkRow,
  ValidationSummary,
  BulkImportJob,
  ColumnMappingPreset,
} from '../features/bulk/types/bulk';
import { DBTemplate } from '../../server/db/schema';

export const BulkPage: React.FC = () => {
  const [step, setStep] = useState<'UPLOAD' | 'MAPPING' | 'TEMPLATE' | 'GRID' | 'HISTORY'>(
    'UPLOAD'
  );
  const [marketplace, setMarketplace] = useState<string>('meesho');

  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [presets, setPresets] = useState<ColumnMappingPreset[]>([]);
  const [importHistory, setImportHistory] = useState<BulkImportJob[]>([]);

  const [rows, setRows] = useState<BulkRow[]>([]);
  const [summary, setSummary] = useState<ValidationSummary>({
    totalRows: 0,
    validRows: 0,
    warningRows: 0,
    errorRows: 0,
    totalErrors: 0,
    totalWarnings: 0,
    fieldErrorCounts: {},
  });

  const [gridFilter, setGridFilter] = useState<
    'ALL' | 'ERROR' | 'WARNING' | 'VALID' | 'MODIFIED'
  >('ALL');
  const [targetFocusCell, setTargetFocusCell] = useState<{
    rowIndex: number;
    fieldKey: string;
  } | null>(null);

  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
  const [selectedRowIndicesForBulkEdit, setSelectedRowIndicesForBulkEdit] = useState<number[]>(
    []
  );
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showBulkAIModal, setShowBulkAIModal] = useState<boolean>(false);
  const [currentImportJobId, setCurrentImportJobId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const tplRes = await fetch('/api/templates');
      const tplJson = await tplRes.json();
      if (tplJson.success && Array.isArray(tplJson.data)) {
        setTemplates(tplJson.data);
      }

      const loadedPresets = await bulkApiService.getMappingPresets();
      setPresets(loadedPresets);

      const history = await bulkApiService.getImports();
      setImportHistory(history);
    } catch (err) {
      console.error('Error loading initial bulk page data:', err);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileSelected = async (file: File) => {
    setIsParsing(true);
    try {
      const result = await bulkParserService.parseFile(file);
      setParseResult(result);
      setIsParsing(false);

      if (result.rows.length === 0) {
        showToast('error', 'Uploaded file contains no readable product rows.');
        return;
      }

      setStep('MAPPING');
      showToast('success', `Parsed ${result.totalRows} catalog rows from ${result.fileName}`);
    } catch (err: any) {
      setIsParsing(false);
      showToast('error', err.message || 'Failed to parse uploaded catalog file.');
    }
  };

  const handleConfirmMapping = (mappings: Record<string, string>) => {
    setColumnMappings(mappings);
    setStep('TEMPLATE');
  };

  const handleConfirmTemplate = async () => {
    if (!parseResult) return;

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

    const initialBulkRows: BulkRow[] = parseResult.rows.map((rawRow, idx) => {
      const mappedData = columnMappingService.mapRow(rawRow, columnMappings);

      if (selectedTemplate) {
        if (!mappedData.brand && selectedTemplate.brand)
          mappedData.brand = selectedTemplate.brand;
        if (!mappedData.category && selectedTemplate.category)
          mappedData.category = selectedTemplate.category;
        if (!mappedData.subCategory && selectedTemplate.subCategory)
          mappedData.subCategory = selectedTemplate.subCategory;
        if (!mappedData.material && selectedTemplate.material)
          mappedData.material = selectedTemplate.material;
        if (!mappedData.gstRate && selectedTemplate.gstRate)
          mappedData.gstRate = selectedTemplate.gstRate;
        if (!mappedData.hsnCode && selectedTemplate.hsnCode)
          mappedData.hsnCode = selectedTemplate.hsnCode;
        if (!mappedData.description && selectedTemplate.description)
          mappedData.description = selectedTemplate.description;
      }

      return {
        id: `row-${idx}`,
        rowIndex: idx,
        originalData: rawRow,
        data: mappedData,
        status: 'UNCHANGED',
        errors: [],
      };
    });

    let existingSkus = new Set<string>();
    try {
      const prodRes = await fetch('/api/products');
      const prodJson = await prodRes.json();
      if (prodJson.success && Array.isArray(prodJson.data)) {
        existingSkus = new Set(
          prodJson.data.map((p: any) => String(p.sku).trim().toUpperCase())
        );
      }
    } catch {
      // Non-fatal fallback
    }

    const startTime = Date.now();
    const { validatedRows, summary: valSummary } = validationEngine.validateRows(
      initialBulkRows,
      marketplace,
      existingSkus
    );
    const durationMs = Date.now() - startTime;

    setRows(validatedRows);
    setSummary(valSummary);

    const savedJob = await bulkApiService.createImport({
      fileName: parseResult.fileName,
      fileSize: parseResult.fileSize,
      marketplace,
      templateId: selectedTemplate?.id,
      templateName: selectedTemplate?.name,
      totalRows: valSummary.totalRows,
      validRows: valSummary.validRows,
      warningRows: valSummary.warningRows,
      errorRows: valSummary.errorRows,
      durationMs,
      rows: validatedRows,
    });

    if (savedJob) {
      setCurrentImportJobId(savedJob.id);
    }

    setStep('GRID');
    showToast(
      'success',
      `Validated ${valSummary.totalRows} rows: ${valSummary.validRows} valid, ${valSummary.errorRows} errors.`
    );
  };

  const handleCellChange = (rowIndex: number, fieldKey: string, newValue: any) => {
    setRows((prevRows) => {
      const nextRows = [...prevRows];
      const targetRowIndex = nextRows.findIndex((r) => r.rowIndex === rowIndex);
      if (targetRowIndex === -1) return prevRows;

      const updatedRow = {
        ...nextRows[targetRowIndex],
        data: {
          ...nextRows[targetRowIndex].data,
          [fieldKey]: newValue,
        },
        isModified: true,
      };

      nextRows[targetRowIndex] = updatedRow;

      const { validatedRows, summary: newSummary } = validationEngine.validateRows(
        nextRows,
        marketplace
      );
      setSummary(newSummary);
      return validatedRows;
    });
  };

  const handleBulkEditRows = (selectedIndices: number[], fieldKey: string, newValue: any) => {
    setRows((prevRows) => {
      const nextRows = [...prevRows];
      const selectedSet = new Set(selectedIndices);

      nextRows.forEach((r) => {
        if (selectedSet.has(r.rowIndex)) {
          r.data[fieldKey] = newValue;
          r.isModified = true;
        }
      });

      const { validatedRows, summary: newSummary } = validationEngine.validateRows(
        nextRows,
        marketplace
      );
      setSummary(newSummary);
      showToast('success', `Updated ${fieldKey} for ${selectedIndices.length} rows.`);
      return validatedRows;
    });
  };

  const handleAutoGenerateSkus = (selectedIndices: number[]) => {
    setRows((prevRows) => {
      const nextRows = [...prevRows];
      const selectedSet = new Set(selectedIndices);

      nextRows.forEach((r) => {
        if (selectedSet.has(r.rowIndex)) {
          const prefix = marketplace.toUpperCase().slice(0, 3);
          const rand = Math.floor(1000 + Math.random() * 9000);
          r.data.sku = `SKU-${prefix}-${r.rowIndex + 1}-${rand}`;
          r.isModified = true;
        }
      });

      const { validatedRows, summary: newSummary } = validationEngine.validateRows(
        nextRows,
        marketplace
      );
      setSummary(newSummary);
      showToast(
        'success',
        `Auto-generated unique SKUs for ${selectedIndices.length} rows.`
      );
      return validatedRows;
    });
  };

  const handleApplyToCatalog = async (mode: 'create' | 'update' | 'upsert') => {
    if (!currentImportJobId) {
      showToast('error', 'No active import job record found.');
      return;
    }

    const validRowsToApply = rows.filter((r) => r.status !== 'ERROR');
    if (validRowsToApply.length === 0) {
      showToast('error', 'Cannot commit catalog. All rows currently contain errors.');
      return;
    }

    const res = await bulkApiService.applyToCatalog(
      currentImportJobId,
      mode,
      validRowsToApply
    );
    if (res.success) {
      showToast('success', res.message);
      const history = await bulkApiService.getImports();
      setImportHistory(history);
    } else {
      showToast('error', res.message);
    }
  };

  const handleSavePreset = async (name: string, mappings: Record<string, string>) => {
    const saved = await bulkApiService.saveMappingPreset(name, marketplace, mappings);
    if (saved) {
      setPresets((prev) => [saved, ...prev]);
      showToast('success', `Mapping preset "${name}" saved.`);
    } else {
      showToast('error', 'Failed to save preset.');
    }
  };

  const handleExportCatalog = (format: 'csv' | 'xlsx') => {
    exportService.exportCatalog(rows, marketplace, format);
    bulkApiService.logExport({
      fileName: `Catalog_${marketplace.toUpperCase()}_${Date.now()}.${format}`,
      format,
      marketplace,
      totalRows: rows.length,
    });
    showToast('success', `Exported catalog file as ${format.toUpperCase()}`);
  };

  const handleExportErrorReport = (format: 'csv' | 'xlsx') => {
    exportService.exportErrorReport(rows, marketplace, format);
    showToast('success', `Exported Error Audit Report as ${format.toUpperCase()}`);
  };

  const handleSelectRowError = (rowIndex: number, fieldKey: string) => {
    setTargetFocusCell({ rowIndex, fieldKey });
  };

  const stepsMeta = [
    { id: 'UPLOAD', num: '1', label: 'Upload File', enabled: true },
    { id: 'MAPPING', num: '2', label: 'Column Mapping', enabled: !!parseResult },
    { id: 'TEMPLATE', num: '3', label: 'Template Defaults', enabled: !!parseResult },
    { id: 'GRID', num: '4', label: 'Spreadsheet Editor', enabled: rows.length > 0 },
  ] as const;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-16 lg:bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-xs font-medium flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-[#101828] text-white border-[#14B8A6]/40'
              : 'bg-rose-950 text-rose-100 border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Bulk Catalog</h1>
          <p className="text-sm text-[#667085] mt-1">
            Upload CSV or Excel sheets, map marketplace columns, resolve errors inline, and export portal-ready catalogs.
          </p>
        </div>

        {/* Platform Selector & History */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E4E7EC] text-xs">
            <span className="px-2 text-[#667085] font-medium">Marketplace:</span>
            {[
              { key: 'meesho', label: 'Meesho' },
              { key: 'flipkart', label: 'Flipkart' },
              { key: 'amazon', label: 'Amazon' },
              { key: 'myntra', label: 'Myntra' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMarketplace(m.key)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  marketplace === m.key
                    ? 'bg-[#101828] text-white'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(step === 'HISTORY' ? 'UPLOAD' : 'HISTORY')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              step === 'HISTORY'
                ? 'bg-[#101828] text-white border-[#101828]'
                : 'bg-white text-[#101828] border-[#E4E7EC] hover:bg-[#F8FAFC]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">History ({importHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Stepper */}
      {step !== 'HISTORY' && (
        <div className="bg-white rounded-xl border border-[#E4E7EC] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
            {stepsMeta.map((s, idx) => {
              const isActive = step === s.id;
              return (
                <React.Fragment key={s.id}>
                  {idx > 0 && <span className="text-[#E4E7EC] hidden sm:inline">/</span>}
                  <button
                    type="button"
                    disabled={!s.enabled}
                    onClick={() => s.enabled && setStep(s.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      s.enabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                    } ${isActive ? 'font-semibold text-[#101828]' : 'text-[#667085] hover:text-[#101828]'}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold ${
                        isActive
                          ? 'bg-[#14B8A6] text-white'
                          : 'bg-[#F8FAFC] text-[#667085] border border-[#E4E7EC]'
                      }`}
                    >
                      {s.num}
                    </span>
                    <span>{s.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {step !== 'UPLOAD' && (
            <button
              type="button"
              onClick={() => {
                setStep('UPLOAD');
                setParseResult(null);
                setRows([]);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#667085] hover:text-[#101828] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Start New Upload</span>
            </button>
          )}
        </div>
      )}

      {/* Workflow Steps */}
      {step === 'UPLOAD' && (
        <FileDropzone onFileSelected={handleFileSelected} isLoading={isParsing} />
      )}

      {step === 'MAPPING' && parseResult && (
        <ColumnMappingStep
          headers={parseResult.headers}
          marketplace={marketplace}
          onConfirmMapping={handleConfirmMapping}
          onBack={() => setStep('UPLOAD')}
          presets={presets}
          onSavePreset={handleSavePreset}
          onDeletePreset={() => {}}
        />
      )}

      {step === 'TEMPLATE' && (
        <TemplateSelectStep
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
          onConfirm={handleConfirmTemplate}
          onBack={() => setStep('MAPPING')}
        />
      )}

      {step === 'GRID' && (
        <div className="space-y-4">
          <ErrorSummaryPanel
            summary={summary}
            rows={rows}
            onSelectRowError={handleSelectRowError}
            onFilterByStatus={setGridFilter}
            activeFilter={gridFilter}
          />

          <SpreadsheetGrid
            rows={rows}
            summary={summary}
            marketplace={marketplace}
            onRowChange={handleCellChange}
            onBulkEditRows={handleBulkEditRows}
            onOpenBulkEditModal={(indices) => {
              setSelectedRowIndicesForBulkEdit(indices);
              setShowBulkEditModal(true);
            }}
            onAutoGenerateSkus={handleAutoGenerateSkus}
            onApplyToCatalog={handleApplyToCatalog}
            onOpenExportModal={() => setShowExportModal(true)}
            onOpenBulkAIModal={() => setShowBulkAIModal(true)}
            activeFilter={gridFilter}
            onFilterChange={setGridFilter}
            targetFocusCell={targetFocusCell}
          />
        </div>
      )}

      {step === 'HISTORY' && (
        <ImportHistoryTable
          imports={importHistory}
          onSelectImport={(job) => {
            if (job.rows && job.rows.length > 0) {
              setRows(job.rows);
              const { summary: sum } = validationEngine.validateRows(
                job.rows,
                job.marketplace
              );
              setSummary(sum);
              setCurrentImportJobId(job.id);
              setMarketplace(job.marketplace);
              setStep('GRID');
              showToast('success', `Loaded import history job "${job.fileName}"`);
            } else {
              showToast('error', 'This historical import job has no stored rows.');
            }
          }}
        />
      )}

      {/* Modals */}
      {showBulkEditModal && (
        <BulkEditModal
          selectedRowIndices={selectedRowIndicesForBulkEdit}
          onApplyBulkEdit={(field, val) =>
            handleBulkEditRows(selectedRowIndicesForBulkEdit, field, val)
          }
          onClose={() => setShowBulkEditModal(false)}
        />
      )}

      {showExportModal && (
        <BulkExportModal
          summary={summary}
          marketplace={marketplace}
          onExportCatalog={handleExportCatalog}
          onExportErrorReport={handleExportErrorReport}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showBulkAIModal && (
        <BulkAIGenerateModal
          isOpen={showBulkAIModal}
          onClose={() => setShowBulkAIModal(false)}
          rows={rows}
          marketplace={marketplace}
          onApplyResultsToRows={(updatedRows) => {
            setRows(updatedRows);
            const { summary: newSummary } = validationEngine.validateRows(
              updatedRows,
              marketplace
            );
            setSummary(newSummary);
            showToast('success', 'Applied generated copy to catalog rows.');
          }}
        />
      )}
    </div>
  );
};
