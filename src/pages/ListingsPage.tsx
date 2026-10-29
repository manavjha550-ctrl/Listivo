import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  Trash2,
  Layers,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useListings } from '../features/listings/hooks/useListings';
import { ListingFilters } from '../features/listings/components/ListingFilters';
import { ListingTableRow } from '../features/listings/components/ListingTableRow';
import { ListingCard } from '../features/listings/components/ListingCard';
import { DeleteListingModal } from '../features/listings/components/DeleteListingModal';
import { StartFromTemplateModal } from '../features/listings/components/StartFromTemplateModal';
import { listingService } from '../features/listings/services/listingService';

export const ListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
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
  } = useListings();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateInitError, setTemplateInitError] = useState<string | null>(null);

  const handleSelectTemplate = async (templateId: string) => {
    setIsTemplateModalOpen(false);
    setTemplateInitError(null);
    try {
      const created = await listingService.createFromTemplate(templateId);
      navigate(`/listings/${created.id}`);
    } catch (err: any) {
      setTemplateInitError(err.message || 'Failed to initialize listing from template.');
    }
  };

  const handleStartScratch = () => {
    setIsTemplateModalOpen(false);
    navigate('/listings/new');
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Product Listings</h1>
          <p className="text-sm text-[#667085] mt-1">
            Create, validate, and manage multi-marketplace catalog listings for Meesho, Flipkart, Amazon, and Myntra.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsTemplateModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          className="shrink-0 self-start sm:self-auto"
        >
          New Listing
        </Button>
      </div>

      {/* Feedback Notifications */}
      {actionSuccessMsg && (
        <div className="px-4 py-3 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg text-xs text-[#0F766E] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {(error || templateInitError) && (
        <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error || templateInitError}</span>
          </div>
          {templateInitError && (
            <button
              type="button"
              onClick={() => setTemplateInitError(null)}
              className="text-xs font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Filters Toolbar */}
      <ListingFilters
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        stats={stats}
      />

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#101828] text-white rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-[#14B8A6] text-white font-mono tabular-nums font-bold">
              {selectedIds.length}
            </span>
            <span>selected in current view</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="xs"
              onClick={handleBulkMarkReady}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Mark Selected Ready
            </Button>
            <Button
              variant="danger"
              size="xs"
              onClick={handleBulkDelete}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Listings Table or Cards */}
      {isLoading ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[#F8FAFC] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : paginatedListings.length === 0 ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-12 text-center space-y-3">
          <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center text-[#667085] mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#101828] text-sm">No Product Listings Found</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            No listings match your current search or filter selection. Reset your filters or create a new listing.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  search: '',
                  category: 'all',
                  marketplace: 'all',
                  status: 'all',
                  sort: 'newest',
                })
              }
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsTemplateModalOpen(true)}
            >
              New Listing
            </Button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] font-semibold text-[#667085] text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all listings on page"
                      checked={
                        selectedIds.length > 0 && selectedIds.length === paginatedListings.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Product &amp; SKU</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Variants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC]">
                {paginatedListings.map((listing) => (
                  <ListingTableRow
                    key={listing.id}
                    listing={listing}
                    isSelected={selectedIds.includes(listing.id)}
                    onToggleSelect={toggleSelectOne}
                    onDuplicate={handleDuplicate}
                    onMarkReady={handleMarkReady}
                    onDeleteClick={(id) => setDeleteId(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSelected={selectedIds.includes(listing.id)}
              onToggleSelect={toggleSelectOne}
              onDuplicate={handleDuplicate}
              onMarkReady={handleMarkReady}
              onDeleteClick={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-[#E4E7EC] rounded-xl px-4 py-3 flex items-center justify-between text-xs text-[#667085]">
          <span className="font-mono tabular-nums">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, listings.length)} of{' '}
            {listings.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1.5 rounded-lg border border-[#E4E7EC] disabled:opacity-40 hover:bg-[#F8FAFC] text-[#101828] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums font-semibold text-[#101828]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded-lg border border-[#E4E7EC] disabled:opacity-40 hover:bg-[#F8FAFC] text-[#101828] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <StartFromTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onStartScratch={handleStartScratch}
      />

      <DeleteListingModal
        isOpen={!!deleteId || isBulkDeleteOpen}
        onClose={() => {
          setDeleteId(null);
          setIsBulkDeleteOpen(false);
        }}
        onConfirm={isBulkDeleteOpen ? confirmBulkDelete : handleDelete}
        isDeleting={isDeleting}
        count={isBulkDeleteOpen ? selectedIds.length : 1}
      />
    </div>
  );
};
