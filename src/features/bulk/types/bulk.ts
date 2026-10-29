export type BulkImportStatus = 'PROCESSING' | 'COMPLETED' | 'COMPLETED_WITH_WARNINGS' | 'FAILED' | 'CANCELLED';
export type RowValidationStatus = 'VALID' | 'WARNING' | 'ERROR' | 'MODIFIED' | 'UNCHANGED';
export type IssueSeverity = 'error' | 'warning';

export interface FieldValidationError {
  field: string; // Listivo field key (e.g. 'sku', 'hsnCode')
  section: string;
  severity: IssueSeverity;
  message: string;
}

export interface BulkRow {
  id: string;
  rowIndex: number;
  originalData: Record<string, any>; // raw data from CSV/XLSX
  data: Record<string, any>;         // mapped & edited data
  status: RowValidationStatus;
  errors: FieldValidationError[];
  isModified?: boolean;
}

export interface BulkImportJob {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  marketplace: string;
  templateId?: string;
  templateName?: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  importedRows: number;
  skippedRows: number;
  status: BulkImportStatus;
  durationMs: number;
  rows?: BulkRow[];
  createdAt: string;
  updatedAt: string;
}

export interface ColumnMappingPreset {
  id: string;
  userId: string;
  name: string;
  marketplace: string;
  mappings: Record<string, string>; // CSV Column Header -> Listivo Field Key
  createdAt: string;
}

export interface ListivoFieldDefinition {
  key: string;
  label: string;
  category: 'core' | 'pricing' | 'logistics' | 'media' | 'attributes';
  isRequired: boolean;
  type: 'string' | 'number' | 'dropdown' | 'url';
  options?: string[];
  aliases: string[]; // Fuzzy matching keywords
  description?: string;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  totalErrors: number;
  totalWarnings: number;
  fieldErrorCounts: Record<string, number>;
}

export interface BulkExportConfig {
  format: 'csv' | 'xlsx';
  marketplace: string;
  includeOnlyValid: boolean;
  sanitizeFormulas: boolean;
}

export type BulkImportMode = 'create' | 'update' | 'upsert';
