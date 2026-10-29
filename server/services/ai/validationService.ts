/**
 * Pre-display AI Output Validation Service
 * Inspects AI outputs before rendering to ensure safety, policy compliance, and formatting.
 */

export interface ValidationIssue {
  code: string;
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warningsCount: number;
  errorsCount: number;
  sanitizedText?: string;
}

const FORBIDDEN_CLAIMS_PATTERNS = [
  /100%\s*guaranteed/i,
  /officially\s*approved\s*by\s*(meesho|flipkart|amazon)/i,
  /cures?\s*cancer|medical\s*cure/i,
  /free\n money|guaranteed\s*cashback/i,
  /fake\s*reviews|#1\s*best\s*seller\s*in\s*india\s*guaranteed/i,
];

export function validateAITitle(title: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!title || title.trim().length === 0) {
    issues.push({ code: 'EMPTY_TITLE', field: 'title', severity: 'error', message: 'Generated title is empty.' });
  } else {
    const trimmed = title.trim();
    if (trimmed.length < 15) {
      issues.push({ code: 'SHORT_TITLE', field: 'title', severity: 'warning', message: 'Title is shorter than 15 characters. May lack key product details.' });
    } else if (trimmed.length > 200) {
      issues.push({ code: 'LONG_TITLE', field: 'title', severity: 'warning', message: 'Title exceeds 200 characters and may get truncated on mobile app search.' });
    }

    for (const pattern of FORBIDDEN_CLAIMS_PATTERNS) {
      if (pattern.test(trimmed)) {
        issues.push({ code: 'FORBIDDEN_CLAIM', field: 'title', severity: 'error', message: 'Title contains an unsupported claim or forbidden keyword.' });
        break;
      }
    }
  }

  const errorsCount = issues.filter(i => i.severity === 'error').length;
  const warningsCount = issues.filter(i => i.severity === 'warning').length;

  return {
    isValid: errorsCount === 0,
    issues,
    errorsCount,
    warningsCount,
  };
}

export function validateAIDescription(description: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!description || description.trim().length === 0) {
    issues.push({ code: 'EMPTY_DESC', field: 'description', severity: 'error', message: 'Generated description is empty.' });
  } else {
    const trimmed = description.trim();
    if (trimmed.length < 40) {
      issues.push({ code: 'SHORT_DESC', field: 'description', severity: 'warning', message: 'Description is very brief. Consider adding more material and usage details.' });
    }

    for (const pattern of FORBIDDEN_CLAIMS_PATTERNS) {
      if (pattern.test(trimmed)) {
        issues.push({ code: 'FORBIDDEN_CLAIM', field: 'description', severity: 'error', message: 'Description contains an unverified claim or prohibited phrase.' });
        break;
      }
    }

    // Check keyword repetition / stuffing (same word appearing > 10 times in a short description)
    const words = trimmed.toLowerCase().split(/\s+/);
    const counts: Record<string, number> = {};
    for (const w of words) {
      if (w.length > 4) {
        counts[w] = (counts[w] || 0) + 1;
        if (counts[w] > 8) {
          issues.push({ code: 'KEYWORD_STUFFING', field: 'description', severity: 'warning', message: `Word "${w}" appears excessively (${counts[w]} times). Reduce repetition for better readability.` });
          break;
        }
      }
    }
  }

  const errorsCount = issues.filter(i => i.severity === 'error').length;
  const warningsCount = issues.filter(i => i.severity === 'warning').length;

  return {
    isValid: errorsCount === 0,
    issues,
    errorsCount,
    warningsCount,
  };
}
