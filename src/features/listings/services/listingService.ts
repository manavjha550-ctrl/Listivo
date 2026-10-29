import {
  ProductListing,
  ListingFilters,
  ListingStats,
  GenerateAIDescriptionInput,
} from '../types/listing';

export const listingService = {
  async getListings(filters?: Partial<ListingFilters>): Promise<{
    data: ProductListing[];
    total: number;
    stats: ListingStats;
  }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.marketplace) params.append('marketplace', filters.marketplace);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sort) params.append('sort', filters.sort);

    const res = await fetch(`/api/products?${params.toString()}`);
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch product listings');
    }
    return {
      data: json.data || [],
      total: json.total || 0,
      stats: json.stats || { total: 0, ready: 0, draft: 0, incomplete: 0, exported: 0 },
    };
  },

  async getListingById(id: string): Promise<ProductListing> {
    const res = await fetch(`/api/products/${id}`);
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch product listing');
    }
    return json.data;
  },

  async createListing(payload: Partial<ProductListing>): Promise<ProductListing> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to create product listing');
    }
    return json.data;
  },

  async updateListing(id: string, payload: Partial<ProductListing>): Promise<ProductListing> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to update product listing');
    }
    return json.data;
  },

  async duplicateListing(id: string): Promise<ProductListing> {
    const res = await fetch(`/api/products/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to duplicate product listing');
    }
    return json.data;
  },

  async markReady(id: string): Promise<ProductListing> {
    const res = await fetch(`/api/products/${id}/mark-ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || json.message || 'Cannot mark listing as ready');
    }
    return json.data;
  },

  async deleteListing(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to delete product listing');
    }
  },

  async createFromTemplate(templateId: string): Promise<ProductListing> {
    const res = await fetch(`/api/templates/${templateId}/create-listing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to create listing from template');
    }
    return json.data;
  },

  async generateAIDescription(input: GenerateAIDescriptionInput): Promise<{
    description: string;
    keyFeatures: string[];
    source: string;
  }> {
    const res = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'AI copy generation failed.');
    }
    return {
      description: json.data.description,
      keyFeatures: json.data.keyFeatures,
      source: json.source || 'gemini-ai',
    };
  },
};
