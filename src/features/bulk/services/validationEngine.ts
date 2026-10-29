import { BulkRow, FieldValidationError, ValidationSummary } from '../types/bulk';

const VALID_GST_SLABS = [0, 3, 5, 12, 18, 28];

export class ValidationEngine {
  /**
   * Validate a batch of mapped bulk catalog rows
   */
  public validateRows(
    rows: BulkRow[],
    marketplace: string = 'meesho',
    existingSkusInDb: Set<string> = new Set()
  ): { validatedRows: BulkRow[]; summary: ValidationSummary } {
    const fileSkuCounts = new Map<string, number>();

    // Pass 1: Count SKU occurrences within the uploaded file
    rows.forEach((row) => {
      const sku = row.data.sku ? String(row.data.sku).trim().toUpperCase() : '';
      if (sku) {
        fileSkuCounts.set(sku, (fileSkuCounts.get(sku) || 0) + 1);
      }
    });

    const validatedRows: BulkRow[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let totalErrors = 0;
    let totalWarnings = 0;
    const fieldErrorCounts: Record<string, number> = {};

    // Pass 2: Field level validation per row
    rows.forEach((row) => {
      const errors: FieldValidationError[] = [];
      const d = row.data;

      // 1. Title Validation
      if (!d.title || String(d.title).trim().length === 0) {
        errors.push({
          field: 'title',
          section: 'Core Product',
          severity: 'error',
          message: 'Product Title is required.',
        });
      } else if (String(d.title).trim().length < 8) {
        errors.push({
          field: 'title',
          section: 'Core Product',
          severity: 'warning',
          message: 'Short product title (<8 chars). Consider adding brand & style for SEO.',
        });
      }

      // 2. SKU Validation
      const skuStr = d.sku ? String(d.sku).trim().toUpperCase() : '';
      if (!skuStr) {
        errors.push({
          field: 'sku',
          section: 'Core Product',
          severity: 'error',
          message: 'SKU Code is required.',
        });
      } else {
        if ((fileSkuCounts.get(skuStr) || 0) > 1) {
          errors.push({
            field: 'sku',
            section: 'Core Product',
            severity: 'error',
            message: `Duplicate SKU "${skuStr}" found within this uploaded catalog file.`,
          });
        }
        if (existingSkusInDb.has(skuStr)) {
          errors.push({
            field: 'sku',
            section: 'Core Product',
            severity: 'warning',
            message: `SKU "${skuStr}" matches an existing product listing in your catalog. Will update on apply.`,
          });
        }
      }

      // 3. Brand Validation
      if (!d.brand || String(d.brand).trim().length === 0) {
        errors.push({
          field: 'brand',
          section: 'Core Product',
          severity: 'error',
          message: 'Brand name is required.',
        });
      }

      // 4. Category Validation
      if (!d.category || String(d.category).trim().length === 0) {
        errors.push({
          field: 'category',
          section: 'Core Product',
          severity: 'error',
          message: 'Marketplace Category is required.',
        });
      }

      // 5. Pricing Validation
      const sellingPrice = Number(d.sellingPrice);
      const mrp = Number(d.mrp);

      if (d.sellingPrice === undefined || d.sellingPrice === '' || isNaN(sellingPrice)) {
        errors.push({
          field: 'sellingPrice',
          section: 'Pricing',
          severity: 'error',
          message: 'Selling price is required.',
        });
      } else if (sellingPrice <= 0) {
        errors.push({
          field: 'sellingPrice',
          section: 'Pricing',
          severity: 'error',
          message: 'Selling price must be greater than ₹0.',
        });
      }

      if (d.mrp === undefined || d.mrp === '' || isNaN(mrp)) {
        errors.push({
          field: 'mrp',
          section: 'Pricing',
          severity: 'error',
          message: 'MRP list price is required.',
        });
      } else if (mrp <= 0) {
        errors.push({
          field: 'mrp',
          section: 'Pricing',
          severity: 'error',
          message: 'MRP must be greater than ₹0.',
        });
      } else if (!isNaN(sellingPrice) && mrp < sellingPrice) {
        errors.push({
          field: 'mrp',
          section: 'Pricing',
          severity: 'error',
          message: `MRP (₹${mrp}) cannot be lower than Selling Price (₹${sellingPrice}).`,
        });
      }

      // 6. GST & HSN Compliance
      if (d.gstRate !== undefined && d.gstRate !== '') {
        const gstNum = Number(d.gstRate);
        if (isNaN(gstNum) || !VALID_GST_SLABS.includes(gstNum)) {
          errors.push({
            field: 'gstRate',
            section: 'Tax & Compliance',
            severity: 'error',
            message: `Invalid GST rate (${d.gstRate}%). Must be one of: 0%, 3%, 5%, 12%, 18%, 28%.`,
          });
        }
      } else {
        errors.push({
          field: 'gstRate',
          section: 'Tax & Compliance',
          severity: 'warning',
          message: 'GST rate not specified. Defaulting to 5%.',
        });
      }

      const hsnStr = d.hsnCode ? String(d.hsnCode).trim() : '';
      if (!hsnStr) {
        errors.push({
          field: 'hsnCode',
          section: 'Tax & Compliance',
          severity: 'error',
          message: 'HSN code is required for GST billing compliance.',
        });
      } else if (!/^\d{4,8}$/.test(hsnStr)) {
        errors.push({
          field: 'hsnCode',
          section: 'Tax & Compliance',
          severity: 'error',
          message: `Invalid HSN Code format "${hsnStr}". Must be 4 to 8 digits (e.g. 6204).`,
        });
      }

      // 7. Inventory Stock
      if (d.stock !== undefined && d.stock !== '') {
        const stockNum = Number(d.stock);
        if (isNaN(stockNum) || stockNum < 0) {
          errors.push({
            field: 'stock',
            section: 'Inventory',
            severity: 'error',
            message: 'Stock quantity cannot be negative.',
          });
        }
      } else {
        errors.push({
          field: 'stock',
          section: 'Inventory',
          severity: 'warning',
          message: 'Stock not specified. Will default to 50 units.',
        });
      }

      // 8. Package Logistics
      if (d.weightGrams !== undefined && d.weightGrams !== '') {
        const w = Number(d.weightGrams);
        if (isNaN(w) || w <= 0) {
          errors.push({
            field: 'weightGrams',
            section: 'Logistics',
            severity: 'error',
            message: 'Package weight must be greater than 0 grams.',
          });
        }
      }

      // 9. Primary Image URL
      const img1 = d.imageUrl1 ? String(d.imageUrl1).trim() : '';
      if (!img1) {
        errors.push({
          field: 'imageUrl1',
          section: 'Media',
          severity: 'error',
          message: 'Main Image URL (Primary) is required.',
        });
      } else if (!img1.startsWith('http://') && !img1.startsWith('https://')) {
        errors.push({
          field: 'imageUrl1',
          section: 'Media',
          severity: 'error',
          message: 'Main Image URL must start with http:// or https://',
        });
      }

      // Calculate status for this row
      const rowErrors = errors.filter((e) => e.severity === 'error');
      const rowWarnings = errors.filter((e) => e.severity === 'warning');

      let rowStatus: BulkRow['status'] = 'VALID';
      if (rowErrors.length > 0) {
        rowStatus = 'ERROR';
        errorCount++;
      } else if (rowWarnings.length > 0) {
        rowStatus = 'WARNING';
        warningCount++;
      } else {
        validCount++;
      }

      totalErrors += rowErrors.length;
      totalWarnings += rowWarnings.length;

      errors.forEach((e) => {
        fieldErrorCounts[e.field] = (fieldErrorCounts[e.field] || 0) + 1;
      });

      validatedRows.push({
        ...row,
        status: row.isModified ? 'MODIFIED' : rowStatus,
        errors,
      });
    });

    return {
      validatedRows,
      summary: {
        totalRows: rows.length,
        validRows: validCount,
        warningRows: warningCount,
        errorRows: errorCount,
        totalErrors,
        totalWarnings,
        fieldErrorCounts,
      },
    };
  }
}

export const validationEngine = new ValidationEngine();
