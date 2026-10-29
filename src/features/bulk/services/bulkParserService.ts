import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParseResult {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
}

/**
 * Sanitizes input string to prevent CSV Formula Injection
 */
export function sanitizeFormulaInjection(value: any): any {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed.length > 0 && ['=', '+', '-', '@'].includes(trimmed[0])) {
    // Prefix with single quote to force text interpretation in Excel/Sheets
    return `'${trimmed}`;
  }
  return value;
}

/**
 * Strips formula injection leading single quote if present
 */
export function desanitizeFormulaInjection(value: any): any {
  if (typeof value === 'string' && value.startsWith("'") && ['=', '+', '-', '@'].includes(value[1])) {
    return value.substring(1);
  }
  return value;
}

export class BulkParserService {
  /**
   * Parse CSV or XLSX File asynchronously
   */
  public async parseFile(
    file: File,
    onProgress?: (progressPercent: number, rowCount: number) => void
  ): Promise<ParseResult> {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      return this.parseExcelFile(file, onProgress);
    } else {
      return this.parseCSVFile(file, onProgress);
    }
  }

  /**
   * Parse CSV using PapaParse
   */
  private parseCSVFile(
    file: File,
    onProgress?: (progressPercent: number, rowCount: number) => void
  ): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          const headers = results.meta.fields ? results.meta.fields.map((h) => h.trim()) : [];
          const rows: Record<string, any>[] = [];

          results.data.forEach((rawRow: any, idx) => {
            const sanitizedRow: Record<string, any> = {};
            Object.keys(rawRow).forEach((key) => {
              sanitizedRow[key.trim()] = sanitizeFormulaInjection(rawRow[key]);
            });
            rows.push(sanitizedRow);
          });

          if (onProgress) onProgress(100, rows.length);

          resolve({
            headers,
            rows,
            totalRows: rows.length,
            fileName: file.name,
            fileSize: file.size,
          });
        },
        error: (err) => {
          reject(new Error(`CSV Parsing error: ${err.message}`));
        },
      });
    });
  }

  /**
   * Parse Excel (.xlsx / .xls) using SheetJS
   */
  private parseExcelFile(
    file: File,
    onProgress?: (progressPercent: number, rowCount: number) => void
  ): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];

          if (!firstSheetName) {
            return reject(new Error('Excel file contains no readable worksheets.'));
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false, // get formatted text values
          });

          if (json.length === 0) {
            return resolve({
              headers: [],
              rows: [],
              totalRows: 0,
              fileName: file.name,
              fileSize: file.size,
            });
          }

          const headers = Object.keys(json[0]).map((h) => h.trim());
          const rows: Record<string, any>[] = [];

          json.forEach((rawRow) => {
            const sanitizedRow: Record<string, any> = {};
            Object.keys(rawRow).forEach((key) => {
              sanitizedRow[key.trim()] = sanitizeFormulaInjection(rawRow[key]);
            });
            rows.push(sanitizedRow);
          });

          if (onProgress) onProgress(100, rows.length);

          resolve({
            headers,
            rows,
            totalRows: rows.length,
            fileName: file.name,
            fileSize: file.size,
          });
        } catch (err: any) {
          reject(new Error(`Excel Parsing error: ${err.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file from disk.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

export const bulkParserService = new BulkParserService();
