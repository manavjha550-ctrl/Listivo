import { useState, useEffect, useCallback } from 'react';
import { ProductListing, ListingFilters, ListingStats } from '../types/listing';
import { listingService } from '../services/listingService';

export function useListings() {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [stats, setStats] = useState<ListingStats>({
    total: 0,
    ready: 0,
    draft: 0,
    incomplete: 0,
    exported: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ListingFilters>({
    search: '',
    category: 'all',
    marketplace: 'all',
    status: 'all',
    sort: 'newest',
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modals & Action States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listingService.getListings(filters);
      setListings(res.data);
      setStats(res.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await listingService.duplicateListing(id);
      setActionSuccessMsg(`Listing duplicated as "${duplicated.sku}".`);
      loadListings();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate listing');
    }
  };

  const handleMarkReady = async (id: string) => {
    try {
      const updated = await listingService.markReady(id);
      setActionSuccessMsg(`Listing "${updated.title}" marked as READY.`);
      loadListings();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Cannot mark as ready due to validation errors.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await listingService.deleteListing(deleteId);
      setActionSuccessMsg('Listing deleted successfully.');
      setDeleteId(null);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteId));
      loadListings();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      for (const id of selectedIds) {
        await listingService.deleteListing(id);
      }
      setActionSuccessMsg(`${selectedIds.length} listings deleted successfully.`);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      loadListings();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Bulk delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkMarkReady = async () => {
    if (selectedIds.length === 0) return;
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedIds) {
      try {
        await listingService.markReady(id);
        successCount++;
      } catch {
        failCount++;
      }
    }
    setActionSuccessMsg(`Marked ${successCount} listings READY. (${failCount} failed validation)`);
    setSelectedIds([]);
    loadListings();
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedListings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedListings.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Pagination logic
  const totalPages = Math.ceil(listings.length / pageSize) || 1;
  const paginatedListings = listings.slice((page - 1) * pageSize, page * pageSize);

  return {
    listings,
    paginatedListings,
    stats,
    isLoading,
    error,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    selectedIds,
    toggleSelectAll,
    toggleSelectOne,
    page,
    setPage,
    totalPages,
    pageSize,
    deleteId,
    setDeleteId,
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    isDeleting,
    actionSuccessMsg,
    handleDuplicate,
    handleMarkReady,
    handleDelete,
    handleBulkDelete,
    confirmBulkDelete,
    handleBulkMarkReady,
    refresh: loadListings,
  };
}
