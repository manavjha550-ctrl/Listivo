/**
 * Frontend AI Types for Listivo Smart Listings & AI Assistant
 */

export interface AIUsageSummary {
  plan: string;
  isOwner: boolean;
  totalRequests: number;
  dailyRequestsUsed: number;
  dailyLimit: number;
  remainingCredits: number;
  canRequest: boolean;
  reason?: string;
}

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
}

export interface AITitleResponse {
  recommendedTitle: string;
  alternativeTitles: string[];
  reasoning: string;
  validation: ValidationResult;
  source: string;
}

export interface AIDescriptionResponse {
  description: string;
  keyFeatures: string[];
  validation: ValidationResult;
  source: string;
}

export interface AIBulletsResponse {
  bulletPoints: string[];
  source: string;
}

export interface AIKeywordResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  relatedPhrases: string[];
  disclaimer: string;
}

export interface AIAttributeItem {
  key: string;
  label: string;
  value: string;
}

export interface AIQualityScore {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  keywordScore: number;
  attributeScore: number;
  complianceScore: number;
  suggestions: string[];
}

export interface SmartListingData {
  title: string;
  category: string;
  subCategory: string;
  brand: string;
  material: string;
  suggestedPrice: number;
  suggestedMRP: number;
  sku: string;
  description: string;
  keyFeatures: string[];
  keywords: AIKeywordResult;
  attributes: AIAttributeItem[];
  qualityScore: AIQualityScore;
  source?: string;
}

export interface AIBulkJob {
  id: string;
  userId: string;
  jobType: string;
  marketplace: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  items: Array<{
    id: string;
    productId?: string;
    title?: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    result?: any;
    error?: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export interface AIVersion {
  id: string;
  productId?: string;
  feature: string;
  previousValue: any;
  generatedValue: any;
  promptUsed?: string;
  qualityScore?: number;
  createdAt: string;
}
