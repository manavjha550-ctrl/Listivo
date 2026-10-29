import { useState, useEffect, useCallback } from 'react';
import { ListingTemplate, TemplateFilterParams } from '../types/template';
import { templateService } from '../services/templateService';

export const useTemplates = (initialParams?: TemplateFilterParams) => {
  const [templates, setTemplates] = useState<ListingTemplate[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<TemplateFilterParams>(initialParams || { sort: 'updated' });

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await templateService.getTemplates(params);
      setTemplates(res.data);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const updateFilters = (newParams: Partial<TemplateFilterParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const deleteTemplate = async (id: string) => {
    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Could not delete template.');
    }
  };

  const duplicateTemplate = async (id: string) => {
    try {
      const duplicated = await templateService.duplicateTemplate(id);
      setTemplates((prev) => [duplicated, ...prev]);
      setTotalCount((prev) => prev + 1);
      return duplicated;
    } catch (err: any) {
      throw new Error(err.message || 'Could not duplicate template.');
    }
  };

  const createListingFromTemplate = async (id: string) => {
    try {
      const product = await templateService.createListingFromTemplate(id);
      // Update template listingsCount in local state
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, listingsCount: (t.listingsCount || 0) + 1 } : t))
      );
      return product;
    } catch (err: any) {
      throw new Error(err.message || 'Could not create listing from template.');
    }
  };

  return {
    templates,
    totalCount,
    isLoading,
    error,
    params,
    updateFilters,
    refetch: fetchTemplates,
    deleteTemplate,
    duplicateTemplate,
    createListingFromTemplate,
  };
};
