import {
  KeywordResearchInput,
  KeywordResearchResult,
  KeywordQualityAnalysis,
  SavedKeywordSet,
  TitleOptimizationResult,
  DescriptionOptimizationResult,
  KeywordIntelligenceItem,
} from '../types/keywordTypes';

export const keywordApiService = {
  // Research Keywords
  async researchKeywords(input: KeywordResearchInput): Promise<KeywordResearchResult> {
    const res = await fetch('/api/keywords/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to generate keyword research.');
    }
    return json.data;
  },

  // Get Saved Keyword Sets
  async getKeywordSets(): Promise<SavedKeywordSet[]> {
    const res = await fetch('/api/keywords/sets');
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch keyword sets.');
    }
    return json.data;
  },

  // Create Keyword Set
  async createKeywordSet(params: {
    name: string;
    marketplace: string;
    category: string;
    keywords: KeywordIntelligenceItem[];
    notes?: string;
  }): Promise<SavedKeywordSet> {
    const res = await fetch('/api/keywords/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to save keyword set.');
    }
    return json.data;
  },

  // Update Keyword Set
  async updateKeywordSet(
    id: string,
    params: Partial<{
      name: string;
      marketplace: string;
      category: string;
      keywords: KeywordIntelligenceItem[];
      notes: string;
    }>
  ): Promise<SavedKeywordSet> {
    const res = await fetch(`/api/keywords/sets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to update keyword set.');
    }
    return json.data;
  },

  // Delete Keyword Set
  async deleteKeywordSet(id: string): Promise<void> {
    const res = await fetch(`/api/keywords/sets/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to delete keyword set.');
    }
  },

  // Analyze Keywords Quality
  async analyzeQuality(
    keywords: KeywordIntelligenceItem[],
    contextText?: string
  ): Promise<KeywordQualityAnalysis> {
    const res = await fetch('/api/keywords/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords, contextText }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to analyze keyword quality.');
    }
    return json.data;
  },

  // Optimize Title
  async optimizeTitle(params: {
    keywords: string[];
    productName: string;
    marketplace?: string;
    brand?: string;
    material?: string;
    color?: string;
  }): Promise<TitleOptimizationResult> {
    const res = await fetch('/api/keywords/optimize-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to optimize title.');
    }
    return json.data;
  },

  // Optimize Description
  async optimizeDescription(params: {
    originalDescription: string;
    keywords: string[];
    marketplace?: string;
    material?: string;
    color?: string;
    productName?: string;
  }): Promise<DescriptionOptimizationResult> {
    const res = await fetch('/api/keywords/optimize-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to optimize description.');
    }
    return json.data;
  },
};
