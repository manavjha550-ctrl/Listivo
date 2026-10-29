import { ListingTemplate, TemplateFilterParams } from '../types/template';

export const templateService = {
  /**
   * Fetch templates with optional search, filters & sort
   */
  async getTemplates(params?: TemplateFilterParams): Promise<{ count: number; total: number; data: ListingTemplate[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.platform) query.append('platform', params.platform);
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`/api/templates?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch templates.');
    }
    const json = await res.json();
    return {
      count: json.count || 0,
      total: json.total || 0,
      data: json.data || [],
    };
  },

  /**
   * Fetch single template by ID
   */
  async getTemplateById(id: string): Promise<ListingTemplate> {
    const res = await fetch(`/api/templates/${id}`);
    if (!res.ok) {
      throw new Error('Template not found or failed to load.');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Create new template
   */
  async createTemplate(templateData: Partial<ListingTemplate>): Promise<ListingTemplate> {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create template.');
    }
    return json.data;
  },

  /**
   * Update existing template
   */
  async updateTemplate(id: string, templateData: Partial<ListingTemplate>): Promise<ListingTemplate> {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update template.');
    }
    return json.data;
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete template.');
    }
  },

  /**
   * Duplicate template
   */
  async duplicateTemplate(id: string): Promise<ListingTemplate> {
    const res = await fetch(`/api/templates/${id}/duplicate`, {
      method: 'POST',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to duplicate template.');
    }
    return json.data;
  },

  /**
   * Create Listing from Template
   */
  async createListingFromTemplate(id: string): Promise<{ id: string; title: string; sku: string }> {
    const res = await fetch(`/api/templates/${id}/create-listing`, {
      method: 'POST',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create listing draft.');
    }
    return json.data;
  },
};
