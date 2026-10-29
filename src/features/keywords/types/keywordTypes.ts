export type KeywordCategory =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'LONG-TAIL'
  | 'ATTRIBUTE'
  | 'BUYING-INTENT'
  | 'SEASONAL';

export interface KeywordIntelligenceItem {
  id: string;
  keyword: string;
  category: KeywordCategory;
  relevanceScore: number;
  suggestedUsage: string;
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW';
  intent: 'HIGH' | 'MEDIUM' | 'LOW';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'active' | 'saved' | 'ignored';
}

export interface KeywordResearchInput {
  productName: string;
  category?: string;
  description?: string;
  material?: string;
  color?: string;
  size?: string;
  targetCustomer?: string;
  marketplace?: string; // 'meesho' | 'flipkart' | 'amazon' | 'myntra'
  language?: string;
  customInstructions?: string;
}

export interface KeywordResearchResult {
  keywords: KeywordIntelligenceItem[];
  summary: {
    totalKeywords: number;
    primaryCount: number;
    secondaryCount: number;
    longTailCount: number;
    attributeCount: number;
    buyingIntentCount: number;
    seasonalCount: number;
  };
  marketplace: string;
  disclaimer: string;
}

export interface KeywordQualityAnalysis {
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  specificity: 'HIGH' | 'MEDIUM' | 'LOW';
  commercialIntent: 'HIGH' | 'MEDIUM' | 'LOW';
  attributeCoverage: 'HIGH' | 'MEDIUM' | 'LOW';
  duplicationRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  keywordStuffingRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
}

export interface SavedKeywordSet {
  id: string;
  userId: string;
  name: string;
  marketplace: string;
  category: string;
  keywords: KeywordIntelligenceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TitleOptimizationResult {
  title: string;
  characterCount: number;
  maxAllowedCharacters: number;
  usedKeywords: string[];
  warnings: string[];
}

export interface DescriptionOptimizationResult {
  currentScore: number;
  potentialScore: number;
  missingKeywords: string[];
  suggestions: string[];
  originalDescription: string;
  optimizedDescription: string;
}
