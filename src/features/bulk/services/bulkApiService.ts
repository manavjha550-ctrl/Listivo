import { BulkImportJob, ColumnMappingPreset } from '../types/bulk';

export class BulkApiService {
  /**
   * Fetch import history for current user
   */
  public async getImports(): Promise<BulkImportJob[]> {
    try {
      const res = await fetch('/api/bulk/imports');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch bulk imports history:', err);
      return [];
    }
  }

  /**
   * Save a new bulk import job record
   */
  public async createImport(importData: Partial<BulkImportJob>): Promise<BulkImportJob | null> {
    try {
      const res = await fetch('/api/bulk/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData),
      });
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to save bulk import:', err);
      return null;
    }
  }

  /**
   * Apply valid bulk rows to product catalog
   */
  public async applyToCatalog(
    importId: string,
    mode: 'create' | 'update' | 'upsert',
    selectedRows?: any[]
  ): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const res = await fetch(`/api/bulk/imports/${importId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, selectedRows }),
      });
      const json = await res.json();
      return {
        success: json.success,
        message: json.message || json.error || 'Failed to apply catalog',
        stats: json.stats,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error applying catalog' };
    }
  }

  /**
   * Fetch column mapping presets
   */
  public async getMappingPresets(): Promise<ColumnMappingPreset[]> {
    try {
      const res = await fetch('/api/bulk/mapping-presets');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch mapping presets:', err);
      return [];
    }
  }

  /**
   * Save column mapping preset
   */
  public async saveMappingPreset(
    name: string,
    marketplace: string,
    mappings: Record<string, string>
  ): Promise<ColumnMappingPreset | null> {
    try {
      const res = await fetch('/api/bulk/mapping-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, marketplace, mappings }),
      });
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to save mapping preset:', err);
      return null;
    }
  }

  /**
   * Log export job
   */
  public async logExport(exportData: {
    fileName: string;
    format: 'csv' | 'xlsx';
    marketplace: string;
    totalRows: number;
  }): Promise<void> {
    try {
      await fetch('/api/bulk/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      });
    } catch (err) {
      console.error('Failed to log export:', err);
    }
  }
}

export const bulkApiService = new BulkApiService();
