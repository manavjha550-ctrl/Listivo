import { MarketplaceAdapter, FieldFillResult, OverwriteOptions } from '../adapters/MarketplaceAdapter';
import { MeeshoFieldMapper, MappedFieldData } from '../mappers/MeeshoFieldMapper';
import { ExtensionTemplateDTO, ExtensionListingDTO } from '../../shared/types';

export interface ValidationIssue {
  fieldKey: string;
  fieldLabel: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

export interface AutofillValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  mappedFieldsCount: number;
}

export interface AutofillSummary {
  totalFields: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  manualCount: number;
  durationMs: number;
  details: FieldFillResult[];
}

export type ProgressCallback = (
  fieldKey: string,
  fieldLabel: string,
  status: string,
  progressPercent: number,
  detail?: FieldFillResult
) => void;

export class AutofillEngine {
  private adapter: MarketplaceAdapter;
  private isExecuting: boolean = false;
  private isAborted: boolean = false;

  constructor(adapter: MarketplaceAdapter) {
    this.adapter = adapter;
  }

  /**
   * Check if autofill engine is currently running
   */
  public isRunning(): boolean {
    return this.isExecuting;
  }

  /**
   * Signal the engine to abort any running autofill process
   */
  public abort(): void {
    if (this.isExecuting) {
      this.isAborted = true;
    }
  }

  /**
   * Pre-autofill validation: verifies readiness of template/listing data before DOM fill
   */
  public validateData(
    data: ExtensionTemplateDTO | ExtensionListingDTO
  ): AutofillValidationResult {
    const mapped = MeeshoFieldMapper.mapData(data);
    const issues: ValidationIssue[] = [];

    const keys = Object.keys(mapped);
    if (keys.length === 0) {
      issues.push({
        fieldKey: 'general',
        fieldLabel: 'Catalog Data',
        severity: 'ERROR',
        message: 'Selected LISTIVO catalog item contains no mapable fields.',
      });
    }

    // Mandatory Meesho fields that must be present and non-empty
    const mandatoryFields: Array<{ key: string; label: string }> = [
      { key: 'title', label: 'Product Name / Title' },
      { key: 'sku', label: 'Style ID / SKU' },
      { key: 'sellingPrice', label: 'Selling Price' },
      { key: 'mrp', label: 'Maximum Retail Price (MRP)' },
    ];

    for (const mandatory of mandatoryFields) {
      const field = mapped[mandatory.key];
      if (!field || field.value === undefined || field.value === null || String(field.value).trim() === '') {
        issues.push({
          fieldKey: mandatory.key,
          fieldLabel: mandatory.label,
          severity: 'ERROR',
          message: `Mandatory field '${mandatory.label}' is missing in LISTIVO record.`,
        });
      }
    }

    for (const key of keys) {
      const field: MappedFieldData = mapped[key];
      if (field.isRequired && (field.value === undefined || field.value === null || String(field.value).trim() === '')) {
        if (!issues.some((i) => i.fieldKey === field.fieldKey)) {
          issues.push({
            fieldKey: field.fieldKey,
            fieldLabel: field.fieldLabel,
            severity: 'ERROR',
            message: `Required field '${field.fieldLabel}' is empty in LISTIVO record.`,
          });
        }
      }
    }

    // MRP vs Selling Price validation rule
    if (mapped.sellingPrice && mapped.mrp) {
      const sp = parseFloat(String(mapped.sellingPrice.value || '').replace(/[^0-9.]/g, ''));
      const mrp = parseFloat(String(mapped.mrp.value || '').replace(/[^0-9.]/g, ''));
      if (!isNaN(sp) && !isNaN(mrp) && mrp < sp) {
        issues.push({
          fieldKey: 'mrp',
          fieldLabel: 'MRP / Selling Price',
          severity: 'ERROR',
          message: `MRP (₹${mrp}) cannot be less than Selling Price (₹${sp}). Please fix pricing in template.`,
        });
      }
    }

    const hasErrors = issues.some((i) => i.severity === 'ERROR');

    return {
      isValid: !hasErrors,
      issues,
      mappedFieldsCount: keys.length,
    };
  }

  /**
   * Execute real DOM autofill sequentially across all mapped fields
   */
  public async executeAutofill(
    data: ExtensionTemplateDTO | ExtensionListingDTO,
    options: OverwriteOptions = { overwritePolicy: 'EMPTY_ONLY' },
    onProgress?: ProgressCallback
  ): Promise<AutofillSummary> {
    if (this.isExecuting) {
      throw new Error('An autofill process is already in progress. Please wait for completion.');
    }

    this.isExecuting = true;
    this.isAborted = false;
    const startTime = Date.now();
    const mapped = MeeshoFieldMapper.mapData(data);
    const keys = Object.keys(mapped);
    const totalFields = keys.length;

    const details: FieldFillResult[] = [];
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let manualCount = 0;

    try {
      for (let i = 0; i < keys.length; i++) {
        // User Abort Check
        if (this.isAborted) {
          details.push({
            fieldKey: 'process_aborted',
            fieldLabel: 'Autofill Process',
            status: 'FAILED',
            reason: 'Autofill was cancelled by the user.',
          });
          failedCount++;
          if (onProgress) {
            onProgress('cancelled', 'Autofill Cancelled', 'FAILED', Math.round(((i + 1) / totalFields) * 100));
          }
          break;
        }

        // Interruption Safety Check: Verify page is still valid form
        const pageDetection = this.adapter.detectPage();
        if (!pageDetection.isListingForm) {
          if (onProgress) {
            onProgress('navigation', 'Page Navigation', 'FAILED', Math.round(((i + 1) / totalFields) * 100));
          }
          details.push({
            fieldKey: 'navigation_interrupted',
            fieldLabel: 'Autofill Process',
            status: 'FAILED',
            reason: 'Autofill interrupted because user navigated away or closed the Meesho listing form.',
          });
          failedCount++;
          break;
        }

        const fieldKey = keys[i];
        const fieldData = mapped[fieldKey];
        const progressPercent = Math.round(((i + 1) / totalFields) * 100);

        if (onProgress) {
          onProgress(fieldKey, fieldData.fieldLabel, 'IN_PROGRESS', progressPercent);
        }

        const result = await this.adapter.fillField(fieldKey, fieldData.value, options);
        details.push(result);

        switch (result.status) {
          case 'SUCCESS':
            successCount++;
            break;
          case 'SKIPPED':
            skippedCount++;
            break;
          case 'MANUAL_CONFIRMATION_REQUIRED':
            manualCount++;
            break;
          case 'FAILED':
          case 'NOT_FOUND':
          case 'NOT_SUPPORTED':
          default:
            failedCount++;
            break;
        }

        if (onProgress) {
          onProgress(fieldKey, fieldData.fieldLabel, result.status, progressPercent, result);
        }

        // Small throttle delay between DOM fields to allow React state settlement
        await new Promise((resolve) => setTimeout(resolve, 180));
      }
    } finally {
      this.isExecuting = false;
      this.isAborted = false;
    }

    const durationMs = Date.now() - startTime;

    return {
      totalFields,
      successCount,
      skippedCount,
      failedCount,
      manualCount,
      durationMs,
      details,
    };
  }

  /**
   * Retry failed fields from previous execution (Max 2 retry attempts)
   */
  public async retryFailedFields(
    failedResults: FieldFillResult[],
    data: ExtensionTemplateDTO | ExtensionListingDTO,
    options: OverwriteOptions = { overwritePolicy: 'REPLACE_ALL' },
    onProgress?: ProgressCallback,
    currentRetryAttempt: number = 1
  ): Promise<FieldFillResult[]> {
    if (currentRetryAttempt > 2) {
      return failedResults.map((f) => ({
        ...f,
        reason: 'Maximum retry limit (2 attempts) reached.',
      }));
    }

    if (this.isExecuting) {
      throw new Error('An autofill process is already in progress.');
    }

    this.isExecuting = true;
    this.isAborted = false;

    const mapped = MeeshoFieldMapper.mapData(data);
    const retryResults: FieldFillResult[] = [];

    // Filter only FAILED and NOT_FOUND items
    const eligibleForRetry = failedResults.filter(
      (r) => r.status === 'FAILED' || r.status === 'NOT_FOUND'
    );

    try {
      for (let i = 0; i < eligibleForRetry.length; i++) {
        if (this.isAborted) break;

        const failed = eligibleForRetry[i];
        const fieldData = mapped[failed.fieldKey];

        if (!fieldData) continue;

        const progressPercent = Math.round(((i + 1) / eligibleForRetry.length) * 100);
        if (onProgress) {
          onProgress(failed.fieldKey, failed.fieldLabel, 'RETRYING', progressPercent);
        }

        const res = await this.adapter.fillField(failed.fieldKey, fieldData.value, options);
        retryResults.push(res);

        if (onProgress) {
          onProgress(failed.fieldKey, failed.fieldLabel, res.status, progressPercent, res);
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } finally {
      this.isExecuting = false;
      this.isAborted = false;
    }

    return retryResults;
  }
}
