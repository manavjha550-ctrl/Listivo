import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Trash2,
  Edit2,
  Check,
  Plus,
  Save,
  Send,
  Info,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { KeywordIntelligenceItem, KeywordCategory } from '../types/keywordTypes';

interface KeywordGridProps {
  keywords: KeywordIntelligenceItem[];
  onUpdateKeywords: (updated: KeywordIntelligenceItem[]) => void;
  onSaveSet: () => void;
  onOpenApplyModal: () => void;
  disclaimer: string;
}

export const KeywordGrid: React.FC<KeywordGridProps> = ({
  keywords,
  onUpdateKeywords,
  onSaveSet,
  onOpenApplyModal,
  disclaimer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'category' | 'keyword'>('relevance');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filteredKeywords = useMemo(() => {
    return keywords
      .filter((item) => {
        const matchesQuery = item.keyword.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'relevance') return b.relevanceScore - a.relevanceScore;
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return a.keyword.localeCompare(b.keyword);
      });
  }, [keywords, searchQuery, selectedCategory, sortBy]);

  const isAllSelected = filteredKeywords.length > 0 && filteredKeywords.every((k) => selectedIds.has(k.id));

  const handleToggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      filteredKeywords.forEach((k) => next.delete(k.id));
    } else {
      filteredKeywords.forEach((k) => next.add(k.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteItem = (id: string) => {
    onUpdateKeywords(keywords.filter((k) => k.id !== id));
    const next = new Set(selectedIds);
    next.delete(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = () => {
    onUpdateKeywords(keywords.filter((k) => !selectedIds.has(k.id)));
    setSelectedIds(new Set());
  };

  const handleStartEdit = (item: KeywordIntelligenceItem) => {
    setEditingId(item.id);
    setEditingText(item.keyword);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    onUpdateKeywords(
      keywords.map((k) => (k.id === id ? { ...k, keyword: editingText.trim().toLowerCase() } : k))
    );
    setEditingId(null);
  };

  const handleCopySingle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySelected = () => {
    const selectedKws = keywords.filter((k) => selectedIds.has(k.id)).map((k) => k.keyword);
    navigator.clipboard.writeText(selectedKws.join(', '));
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2000);
  };

  const handleAddNewKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordInput.trim()) return;

    const newItem: KeywordIntelligenceItem = {
      id: `kw-custom-${Date.now()}`,
      keyword: newKeywordInput.trim().toLowerCase(),
      category: 'PRIMARY',
      relevanceScore: 90,
      suggestedUsage: 'Title & Search Tags',
      confidenceLabel: 'HIGH',
      intent: 'HIGH',
      risk: 'LOW',
      status: 'active',
    };

    onUpdateKeywords([newItem, ...keywords]);
    setNewKeywordInput('');
    setIsAddingNew(false);
  };

  const getCategoryTone = (category: KeywordCategory) => {
    switch (category) {
      case 'PRIMARY':
        return 'text-[#0F766E]';
      case 'SECONDARY':
        return 'text-[#2563EB]';
      case 'BUYING-INTENT':
        return 'text-[#101828]';
      case 'SEASONAL':
        return 'text-amber-700';
      default:
        return 'text-[#667085]';
    }
  };

  return (
    <Card padding="none" className="border-[#E4E7EC] overflow-hidden bg-white">
      {/* Disclaimer Notice Header */}
      <div className="bg-[#F8FAFC] border-b border-[#E4E7EC] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
          <span>{disclaimer || 'Search volume unavailable — relevance is estimated from marketplace signals.'}</span>
        </div>
        <span className="text-[11px] font-medium text-[#475467]">Marketplace Indexing Rules</span>
      </div>

      {/* Grid Control Toolbar */}
      <div className="p-3.5 bg-white border-b border-[#E4E7EC] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                placeholder="Filter keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg font-medium text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="ALL">All Types ({keywords.length})</option>
              <option value="PRIMARY">Primary</option>
              <option value="SECONDARY">Secondary</option>
              <option value="LONG-TAIL">Long-Tail</option>
              <option value="ATTRIBUTE">Attribute</option>
              <option value="BUYING-INTENT">Buying Intent</option>
              <option value="SEASONAL">Seasonal</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#D0D5DD] rounded-lg font-medium text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="category">Sort: Type</option>
              <option value="keyword">Sort: A–Z</option>
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(!isAddingNew)}
              icon={<Plus className="w-3.5 h-3.5 text-[#0F766E]" />}
            >
              Add Term
            </Button>

            <Button size="sm" variant="outline" onClick={onSaveSet} icon={<Save className="w-3.5 h-3.5" />}>
              Save Set
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={onOpenApplyModal}
              disabled={selectedIds.size === 0 && keywords.length === 0}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Apply ({selectedIds.size || keywords.length})
            </Button>
          </div>
        </div>

        {/* Selected Items Batch Bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-[#101828] text-white text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold">
                <span className="font-mono tabular-nums">{selectedIds.size}</span> selected
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] text-[#98A2B3] hover:text-white underline"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySelected}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                {batchCopied ? <Check className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{batchCopied ? 'Copied' : 'Copy Selected'}</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* Add New Keyword Bar */}
        {isAddingNew && (
          <form onSubmit={handleAddNewKeyword} className="flex items-center gap-2 pt-2 border-t border-[#E4E7EC]">
            <input
              type="text"
              autoFocus
              placeholder="Enter custom search phrase..."
              value={newKeywordInput}
              onChange={(e) => setNewKeywordInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#14B8A6]"
            />
            <Button size="xs" variant="teal" type="submit">
              Add
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
          </form>
        )}
      </div>

      {/* Compact Spreadsheet Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F8FAFC] text-[#475467] font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-[#E4E7EC]">
            <tr>
              <th className="py-2.5 px-3.5 w-10 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  aria-label="Toggle select all keywords"
                  className="text-[#667085] hover:text-[#101828]"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#0F766E]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#98A2B3]" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 min-w-[200px]">Keyword Phrase</th>
              <th className="py-2.5 px-3 w-32">Classification</th>
              <th className="py-2.5 px-3 w-24 text-right">Relevance</th>
              <th className="py-2.5 px-3 w-28">Buyer Intent</th>
              <th className="py-2.5 px-3 min-w-[170px]">Recommended Placement</th>
              <th className="py-2.5 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC] text-[#101828]">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#667085]">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Search className="w-7 h-7 text-[#98A2B3]" />
                    <p className="font-semibold text-[#101828]">No keywords match your filter</p>
                    <p className="text-xs text-[#667085]">Clear your search filter or run a new keyword query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredKeywords.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#F8FAFC] transition-colors ${isSelected ? 'bg-[#14B8A6]/5' : ''}`}
                  >
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        aria-label={`Select ${item.keyword}`}
                        className="text-[#667085] hover:text-[#101828]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#0F766E]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#D0D5DD]" />
                        )}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-[#101828]">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                            className="px-2 py-1 text-xs border border-[#14B8A6] rounded focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 text-[#0F766E] hover:bg-[#14B8A6]/10 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span>{item.keyword}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-semibold uppercase tracking-wide ${getCategoryTone(item.category)}`}>
                        {item.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      <span className="font-semibold text-[#101828]">{item.relevanceScore}</span>
                      <span className="text-[11px] text-[#667085]">/100</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.intent === 'HIGH'
                            ? 'text-[#0F766E]'
                            : item.intent === 'MEDIUM'
                            ? 'text-amber-700'
                            : 'text-[#667085]'
                        }`}
                      >
                        {item.intent}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#667085] text-[11px]">{item.suggestedUsage}</td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopySingle(item.id, item.keyword)}
                          title="Copy keyword"
                          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          title="Edit keyword"
                          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete keyword"
                          className="p-1.5 text-[#667085] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
        <span>
          Showing <strong className="font-mono tabular-nums text-[#101828]">{filteredKeywords.length}</strong> of{' '}
          <span className="font-mono tabular-nums">{keywords.length}</span> keywords
        </span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleToggleSelectAll} className="hover:text-[#101828] font-medium">
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={handleClearSelection} className="hover:text-[#101828] font-medium">
            Clear Selection
          </button>
        </div>
      </div>
    </Card>
  );
};
