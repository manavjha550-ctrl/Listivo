import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Copy, Edit2, Check, Folder, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SavedKeywordSet, KeywordIntelligenceItem } from '../types/keywordTypes';
import { keywordApiService } from '../services/keywordApiService';

interface KeywordSetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeKeywords: KeywordIntelligenceItem[];
  currentMarketplace: string;
  onLoadKeywordSet: (set: SavedKeywordSet) => void;
}

export const KeywordSetsModal: React.FC<KeywordSetsModalProps> = ({
  isOpen,
  onClose,
  activeKeywords,
  currentMarketplace,
  onLoadKeywordSet,
}) => {
  const [sets, setSets] = useState<SavedKeywordSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [setNameInput, setSetNameInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotice(null);
      setConfirmDeleteId(null);
      fetchSets();
    }
  }, [isOpen]);

  const fetchSets = async () => {
    setIsLoading(true);
    try {
      const data = await keywordApiService.getKeywordSets();
      setSets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveCurrentSet = async () => {
    if (!setNameInput.trim()) {
      setNotice({ type: 'error', message: 'Enter a name for this keyword set.' });
      return;
    }

    setNotice(null);
    try {
      const newSet = await keywordApiService.createKeywordSet({
        name: setNameInput.trim(),
        marketplace: currentMarketplace || 'meesho',
        category: 'General',
        keywords: activeKeywords,
        notes: '',
      });

      setSets([newSet, ...sets]);
      setSetNameInput('');
      setNotice({ type: 'success', message: `Saved keyword set "${newSet.name}".` });
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to save keyword set.' });
    }
  };

  const handleDeleteSet = async (id: string) => {
    try {
      await keywordApiService.deleteKeywordSet(id);
      setSets(sets.filter((s) => s.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to delete set.' });
    }
  };

  const handleDuplicateSet = async (set: SavedKeywordSet) => {
    try {
      const duplicated = await keywordApiService.createKeywordSet({
        name: `${set.name} (Copy)`,
        marketplace: set.marketplace,
        category: set.category,
        keywords: set.keywords,
        notes: set.notes,
      });
      setSets([duplicated, ...sets]);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to duplicate set.' });
    }
  };

  const handleRenameSet = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const updated = await keywordApiService.updateKeywordSet(id, { name: editingName.trim() });
      setSets(sets.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Failed to rename set.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/55 backdrop-blur-[2px] p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-[#E4E7EC] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#101828] text-white flex items-center justify-between border-b border-[#1D2939]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/15 border border-[#14B8A6]/30 flex items-center justify-center">
              <Folder className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Saved Keyword Sets</h2>
              <p className="text-xs text-[#98A2B3]">Store and reuse search clusters across product listings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#98A2B3] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to Save Current Active Keywords */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E4E7EC] space-y-2.5">
          <span className="text-xs font-semibold text-[#101828] block">
            Save Active Cluster (<span className="font-mono tabular-nums">{activeKeywords.length}</span> keywords)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="e.g. Women Rayon Kurti Cluster"
              value={setNameInput}
              onChange={(e) => setSetNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentSet()}
              className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-[#D0D5DD] rounded-lg text-[#101828] focus:outline-none focus:border-[#14B8A6]"
            />
            <Button
              size="sm"
              variant="teal"
              onClick={handleSaveCurrentSet}
              disabled={activeKeywords.length === 0}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Cluster
            </Button>
          </div>

          {notice && (
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                notice.type === 'success'
                  ? 'bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#101828]'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              <span>{notice.message}</span>
            </div>
          )}
        </div>

        {/* Saved Sets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-white">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-[#667085]">Loading saved keyword sets...</div>
          ) : sets.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#667085]">
              No saved keyword sets yet. Name and save your active cluster above.
            </div>
          ) : (
            sets.map((set) => (
              <div
                key={set.id}
                className="p-3.5 rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] hover:bg-white hover:border-[#D0D5DD] transition-colors space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {editingId === set.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSet(set.id)}
                          className="px-2 py-1 text-xs border border-[#14B8A6] rounded bg-white text-[#101828]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameSet(set.id)}
                          className="p-1 text-[#0F766E]"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-[#101828]">{set.name}</span>
                    )}

                    <span className="text-[#D0D5DD]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0F766E]">
                      {set.marketplace}
                    </span>
                    <span className="text-[#D0D5DD]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-[#667085]">
                      {set.keywords?.length || 0} terms
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {confirmDeleteId === set.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button size="xs" variant="danger" onClick={() => handleDeleteSet(set.id)}>
                          Confirm Delete
                        </Button>
                        <Button size="xs" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => {
                            onLoadKeywordSet(set);
                            onClose();
                          }}
                          icon={<Send className="w-3 h-3" />}
                        >
                          Load
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateSet(set)}
                          title="Duplicate set"
                          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(set.id);
                            setEditingName(set.name);
                          }}
                          title="Rename set"
                          className="p-1.5 text-[#667085] hover:text-[#101828] hover:bg-[#E4E7EC]/60 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(set.id)}
                          title="Delete set"
                          className="p-1.5 text-[#667085] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Keyword Preview */}
                <p className="text-xs text-[#667085] truncate">
                  {set.keywords?.slice(0, 6).map((kw) => kw.keyword).join(' · ')}
                  {(set.keywords?.length || 0) > 6 ? ` · +${(set.keywords?.length || 0) - 6} more` : ''}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E4E7EC] text-right">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
