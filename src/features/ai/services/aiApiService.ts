/**
 * Frontend API Service for AI Engine & Smart Listings
 */

import {
  AIUsageSummary,
  AITitleResponse,
  AIDescriptionResponse,
  AIBulletsResponse,
  AIKeywordResult,
  AIAttributeItem,
  AIQualityScore,
  SmartListingData,
  AIBulkJob,
  AIVersion,
} from '../types/ai';

export const aiApiService = {
  // Usage and Credits
  async getUsageSummary(): Promise<AIUsageSummary> {
    const res = await fetch('/api/ai/usage');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch AI usage.');
    return json.data;
  },

  // Title Generator
  async generateTitle(params: {
    title?: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    material?: string;
    color?: string;
    marketplace?: string;
    rawText?: string;
  }): Promise<AITitleResponse> {
    const res = await fetch('/api/ai/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate title.');
    return json.data;
  },

  // Description Generator
  async generateDescription(params: {
    title?: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    material?: string;
    color?: string;
    price?: number;
    mrp?: number;
    keyFeatures?: string[];
    tone?: 'professional' | 'seo' | 'festive' | 'concise';
    customInstructions?: string;
  }): Promise<AIDescriptionResponse> {
    const res = await fetch('/api/ai/description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate description.');
    return json.data;
  },

  // Bullet Points Generator
  async generateBullets(params: {
    title?: string;
    brand?: string;
    material?: string;
    rawText?: string;
  }): Promise<AIBulletsResponse> {
    const res = await fetch('/api/ai/bullets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate bullet points.');
    return json.data;
  },

  // Keywords Generator
  async generateKeywords(params: {
    title?: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    material?: string;
    color?: string;
  }): Promise<AIKeywordResult> {
    const res = await fetch('/api/ai/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate keywords.');
    return json.data;
  },

  // Attributes Generator
  async generateAttributes(params: {
    title?: string;
    category?: string;
    material?: string;
    rawText?: string;
  }): Promise<{ attributes: AIAttributeItem[]; source: string }> {
    const res = await fetch('/api/ai/attributes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to infer attributes.');
    return json.data;
  },

  // Refinement / Editing
  async refineText(params: {
    text: string;
    instruction: string;
    brand?: string;
    category?: string;
    marketplace?: string;
  }): Promise<{ refinedText: string; changesMade: string; source: string }> {
    const res = await fetch('/api/ai/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to refine text.');
    return json.data;
  },

  // Quality Score Calculation
  async calculateQualityScore(params: {
    title?: string;
    description?: string;
    keyFeatures?: string[];
    material?: string;
    brand?: string;
    marketplace?: string;
  }): Promise<AIQualityScore> {
    const res = await fetch('/api/ai/quality-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to calculate quality score.');
    return json.data;
  },

  // Smart Listing Generation
  async generateSmartListing(params: {
    rawText: string;
    marketplace?: string;
    brand?: string;
  }): Promise<SmartListingData> {
    const res = await fetch('/api/ai/smart-listing/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate smart listing.');
    return json.data;
  },

  // Save Draft Smart Listing
  async saveSmartListing(data: any): Promise<any> {
    const res = await fetch('/api/ai/smart-listing/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save smart listing.');
    return json.data;
  },

  // Bulk AI Job
  async createBulkAIJob(params: {
    jobType: string;
    marketplace: string;
    items: any[];
  }): Promise<AIBulkJob> {
    const res = await fetch('/api/ai/bulk-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to start bulk AI job.');
    return json.data;
  },

  // Version History
  async saveVersion(params: {
    productId?: string;
    feature: string;
    previousValue: any;
    generatedValue: any;
    promptUsed?: string;
    qualityScore?: number;
  }): Promise<AIVersion> {
    const res = await fetch('/api/ai/versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save version.');
    return json.data;
  },

  async getVersions(productId: string): Promise<AIVersion[]> {
    const res = await fetch(`/api/ai/versions/${productId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch versions.');
    return json.data;
  },
};
