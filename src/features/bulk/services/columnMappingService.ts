import { STANDARD_LISTIVO_FIELDS } from './standardFields';
import { ColumnMappingPreset } from '../types/bulk';

export interface ColumnMatchResult {
  csvHeader: string;
  mappedKey: string | null; // Listivo field key or null (unmapped)
  confidence: number;       // 0 to 100%
  suggestedLabel: string | null;
}

export class ColumnMappingService {
  /**
   * Automatically match CSV headers to standard Listivo fields
   */
  public autoMapHeaders(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    const usedListivoKeys = new Set<string>();

    for (const header of headers) {
      const match = this.findBestMatch(header, usedListivoKeys);
      if (match && match.confidence >= 60 && match.mappedKey) {
        mappings[header] = match.mappedKey;
        usedListivoKeys.add(match.mappedKey);
      } else {
        mappings[header] = 'ignore'; // Default unmapped or ignore
      }
    }

    return mappings;
  }

  /**
   * Get detailed match scores for headers
   */
  public getHeaderMatches(headers: string[]): ColumnMatchResult[] {
    const results: ColumnMatchResult[] = [];
    const usedKeys = new Set<string>();

    for (const header of headers) {
      const best = this.findBestMatch(header, usedKeys);
      if (best && best.confidence >= 60 && best.mappedKey) {
        usedKeys.add(best.mappedKey);
        results.push(best);
      } else {
        results.push({
          csvHeader: header,
          mappedKey: null,
          confidence: 0,
          suggestedLabel: null,
        });
      }
    }

    return results;
  }

  private findBestMatch(header: string, usedKeys: Set<string>): ColumnMatchResult | null {
    const cleanHeader = header.trim().toLowerCase().replace(/[^a-z0-9\s_]/g, '');

    let highestScore = 0;
    let matchedFieldKey: string | null = null;
    let matchedFieldLabel: string | null = null;

    for (const field of STANDARD_LISTIVO_FIELDS) {
      if (usedKeys.has(field.key)) continue;

      // Exact match with key
      if (cleanHeader === field.key.toLowerCase()) {
        return {
          csvHeader: header,
          mappedKey: field.key,
          confidence: 100,
          suggestedLabel: field.label,
        };
      }

      // Exact match with label
      if (cleanHeader === field.label.toLowerCase()) {
        return {
          csvHeader: header,
          mappedKey: field.key,
          confidence: 100,
          suggestedLabel: field.label,
        };
      }

      // Check aliases
      for (const alias of field.aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9\s_]/g, '');
        if (cleanHeader === cleanAlias) {
          return {
            csvHeader: header,
            mappedKey: field.key,
            confidence: 95,
            suggestedLabel: field.label,
          };
        }

        // Substring / Includes match
        if (cleanHeader.includes(cleanAlias) || cleanAlias.includes(cleanHeader)) {
          const score = 75;
          if (score > highestScore) {
            highestScore = score;
            matchedFieldKey = field.key;
            matchedFieldLabel = field.label;
          }
        }
      }
    }

    if (matchedFieldKey && highestScore > 0) {
      return {
        csvHeader: header,
        mappedKey: matchedFieldKey,
        confidence: highestScore,
        suggestedLabel: matchedFieldLabel,
      };
    }

    return null;
  }

  /**
   * Map raw CSV row to standard Listivo fields using active column mapping
   */
  public mapRow(
    rawRow: Record<string, any>,
    mappings: Record<string, string>
  ): Record<string, any> {
    const mappedRow: Record<string, any> = {};

    Object.entries(mappings).forEach(([csvCol, listivoKey]) => {
      if (listivoKey && listivoKey !== 'ignore' && rawRow[csvCol] !== undefined) {
        mappedRow[listivoKey] = rawRow[csvCol];
      }
    });

    return mappedRow;
  }
}

export const columnMappingService = new ColumnMappingService();
