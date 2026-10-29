import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { BulkRow, FieldValidationError } from '../types/bulk';
import { sanitizeFormulaInjection } from './bulkParserService';

export class ExportService {
  /**
   * Export valid or all catalog rows to CSV / XLSX
   */
  public exportCatalog(
    rows: BulkRow[],
    marketplace: string,
    format: 'csv' | 'xlsx' = 'csv',
    fileName?: string
  ) {
    const exportData = rows.map((row) => {
      const cleanData: Record<string, any> = {};
      Object.entries(row.data).forEach(([key, val]) => {
        cleanData[key] = sanitizeFormulaInjection(val);
      });
      return cleanData;
    });

    const outputName = fileName || `LISTIVO_Catalog_${marketplace.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'xlsx') {
      this.downloadXLSX(exportData, outputName, 'Catalog');
    } else {
      this.downloadCSV(exportData, outputName);
    }
  }

  /**
   * Generate & Download Error Report
   */
  public exportErrorReport(
    rows: BulkRow[],
    marketplace: string,
    format: 'csv' | 'xlsx' = 'csv'
  ) {
    const errorRecords: Array<{
      'Row #': number;
      'SKU ID': string;
      'Product Title': string;
      'Error Field': string;
      'Severity': string;
      'Error Message': string;
      'Submitted Value': string;
    }> = [];

    rows.forEach((row) => {
      if (row.errors && row.errors.length > 0) {
        row.errors.forEach((err: FieldValidationError) => {
          errorRecords.push({
            'Row #': row.rowIndex + 1,
            'SKU ID': String(row.data.sku || 'N/A'),
            'Product Title': String(row.data.title || 'N/A'),
            'Error Field': err.field,
            'Severity': err.severity.toUpperCase(),
            'Error Message': err.message,
            'Submitted Value': String(row.data[err.field] || 'EMPTY'),
          });
        });
      }
    });

    const outputName = `LISTIVO_Error_Report_${marketplace.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'xlsx') {
      this.downloadXLSX(errorRecords, outputName, 'Error_Report');
    } else {
      this.downloadCSV(errorRecords, outputName);
    }
  }

  private downloadCSV(data: any[], fileName: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private downloadXLSX(data: any[], fileName: string, sheetName: string = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);
  }
}

export const exportService = new ExportService();
