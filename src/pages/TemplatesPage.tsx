import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  AlertCircle,
  PlusCircle,
  Copy,
  Edit,
  Trash2,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { useTemplates } from '../features/templates/hooks/useTemplates';
import { TemplateFilters } from '../features/templates/components/TemplateFilters';
import { TemplateCard } from '../features/templates/components/TemplateCard';
import { DeleteTemplateModal } from '../features/templates/components/DeleteTemplateModal';
import { ListingTemplate } from '../features/templates/types/template';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    templates,
    totalCount,
    isLoading,
    error,
    params,
    updateFilters,
    deleteTemplate,
    duplicateTemplate,
    createListingFromTemplate,
  } = useTemplates();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [templateToDelete, setTemplateToDelete] = useState<ListingTemplate | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const handleDeleteConfirm = async (id: string) => {
    await deleteTemplate(id);
    setFeedback({ type: 'success', message: 'Template deleted.' });
  };

  const handleRowCreateListing = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionBusyId(id);
    setFeedback(null);
    try {
      await createListingFromTemplate(id);
      navigate('/listings');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Could not create listing from template.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  const handleRowDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionBusyId(id);
    setFeedback(null);
    try {
      await duplicateTemplate(id);
      setFeedback({ type: 'success', message: 'Template duplicated.' });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Could not duplicate template.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  const formatMarketplace = (platform: string) => {
    const p = (platform || 'meesho').toLowerCase();
    if (p === 'meesho') return 'Meesho';
    if (p === 'flipkart') return 'Flipkart';
    if (p === 'amazon') return 'Amazon India';
    if (p === 'myntra') return 'Myntra';
    return platform;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Listing Templates</h1>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Standardize category attributes, GST/HSN tax rules, and package dimensions for rapid catalog creation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="inline-flex items-center p-0.5 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg"
            role="group"
            aria-label="Template view mode"
          >
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#101828] shadow-xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#101828] shadow-xs border border-[#E4E7EC]'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/templates/new')}
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#0F766E]'
          }`}
        >
          <span className="font-medium">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <TemplateFilters
        params={params}
        onFilterChange={updateFilters}
        totalCount={totalCount}
        filteredCount={templates.length}
      />

      {/* Main Content */}
      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-semibold">Error loading templates</p>
            <p className="text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-12 bg-[#F8FAFC] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-8">
          <EmptyState
            icon={<FileText className="w-8 h-8 text-[#14B8A6]" />}
            title="No Templates Found"
            description={
              params.search ||
              (params.category && params.category !== 'ALL') ||
              (params.platform && params.platform !== 'ALL')
                ? 'No templates match your current filter selection. Clear filters or create a new template.'
                : 'Create your first reusable template to save GST, HSN, and category attributes across your catalog.'
            }
            actionLabel="Create New Template"
            onAction={() => navigate('/templates/new')}
          />
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-[#E4E7EC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4E7EC] bg-[#F8FAFC] text-[11px] font-semibold text-[#667085]">
                  <th className="py-3 px-4">Template Name</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">GST &amp; HSN</th>
                  <th className="py-3 px-4 text-right">Attributes</th>
                  <th className="py-3 px-4 text-right">Listings</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] text-xs">
                {templates.map((tpl) => {
                  const primaryImage = tpl.images && tpl.images.length > 0 ? tpl.images[0] : null;
                  const isBusy = actionBusyId === tpl.id;
                  return (
                    <tr
                      key={tpl.id}
                      onClick={() => navigate(`/templates/${tpl.id}`)}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={tpl.name}
                              className="w-9 h-9 rounded-lg object-cover border border-[#E4E7EC] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center shrink-0 text-[#667085]">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-[#101828] group-hover:text-[#0F766E] truncate">
                              {tpl.name}
                            </div>
                            <div className="text-[11px] text-[#667085] truncate">
                              {tpl.brand || 'Unbranded'}
                              {tpl.skuPrefix ? ` · ${tpl.skuPrefix}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#101828]">
                        {formatMarketplace(tpl.marketplace)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[#667085]">
                        <span className="text-[#101828] font-medium">{tpl.category}</span>
                        {tpl.subCategory ? ` · ${tpl.subCategory}` : ''}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums text-[#101828]">
                        {tpl.gstRate}% · HSN {tpl.hsnCode}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#101828]">
                        {tpl.attributes?.length || 0}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#101828]">
                        {tpl.listingsCount || 0}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[#667085] font-mono tabular-nums text-[11px]">
                        {new Date(tpl.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div
                          className="inline-flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="xs"
                            isLoading={isBusy}
                            icon={<PlusCircle className="w-3.5 h-3.5 text-[#0F766E]" />}
                            onClick={(e) => handleRowCreateListing(e, tpl.id)}
                          >
                            Use
                          </Button>
                          <button
                            type="button"
                            title="Edit Template"
                            onClick={() => navigate(`/templates/${tpl.id}`)}
                            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-md transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Duplicate Template"
                            disabled={isBusy}
                            onClick={(e) => handleRowDuplicate(e, tpl.id)}
                            className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] rounded-md transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Template"
                            onClick={() => setTemplateToDelete(tpl)}
                            className="p-1.5 text-[#667085] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onDuplicate={async (id) => {
                await duplicateTemplate(id);
                setFeedback({ type: 'success', message: 'Template duplicated.' });
              }}
              onCreateListing={async (id) => {
                await createListingFromTemplate(id);
              }}
              onDeleteRequest={(template) => {
                setTemplateToDelete(template);
              }}
              onErrorFeedback={(msg) => setFeedback({ type: 'error', message: msg })}
            />
          ))}
        </div>
      )}

      <DeleteTemplateModal
        template={templateToDelete}
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
};
