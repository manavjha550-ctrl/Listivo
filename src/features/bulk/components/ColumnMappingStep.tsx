import React, { useState, useEffect } from 'react';
import { STANDARD_LISTIVO_FIELDS } from '../services/standardFields';
import { ColumnMappingPreset } from '../types/bulk';
import { columnMappingService, ColumnMatchResult } from '../services/columnMappingService';
import { CheckCircle2, ArrowRight, Bookmark } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface ColumnMappingStepProps {
  headers: string[];
  marketplace: string;
  onConfirmMapping: (mappings: Record<string, string>) => void;
  onBack: () => void;
  presets: ColumnMappingPreset[];
  onSavePreset: (name: string, mappings: Record<string, string>) => void;
  onDeletePreset: (id: string) => void;
}

export const ColumnMappingStep: React.FC<ColumnMappingStepProps> = ({
  headers,
  marketplace,
  onConfirmMapping,
  onBack,
  presets,
  onSavePreset,
}) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [matchResults, setMatchResults] = useState<ColumnMatchResult[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);

  useEffect(() => {
    const initialAutoMap = columnMappingService.autoMapHeaders(headers);
    setMappings(initialAutoMap);
    const matches = columnMappingService.getHeaderMatches(headers);
    setMatchResults(matches);
  }, [headers]);

  const handleMappingChange = (csvHeader: string, listivoKey: string) => {
    setMappings((prev) => ({
      ...prev,
      [csvHeader]: listivoKey,
    }));
  };

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      setMappings((prev) => ({
        ...prev,
        ...preset.mappings,
      }));
    }
  };

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim(), mappings);
    setNewPresetName('');
    setShowPresetModal(false);
  };

  const mappedCount = Object.values(mappings).filter((k) => k && k !== 'ignore').length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#101828]">
            Map Spreadsheet Columns to LISTIVO Fields
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            Auto-matched{' '}
            <strong className="font-mono tabular-nums text-[#101828]">{mappedCount}</strong> of{' '}
            <strong className="font-mono tabular-nums text-[#101828]">{headers.length}</strong>{' '}
            detected columns. Review or adjust mappings below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.length > 0 && (
            <select
              value={selectedPresetId}
              onChange={(e) => handleApplyPreset(e.target.value)}
              aria-label="Apply saved mapping preset"
              className="text-xs border border-[#E4E7EC] rounded-lg px-3 py-2 bg-[#F8FAFC] text-[#101828] font-medium focus:border-[#14B8A6] focus:outline-none cursor-pointer"
            >
              <option value="">Apply Mapping Preset...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.marketplace.toUpperCase()})
                </option>
              ))}
            </select>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Bookmark className="w-3.5 h-3.5 text-[#14B8A6]" />}
            onClick={() => setShowPresetModal(true)}
          >
            Save Preset
          </Button>
        </div>
      </div>

      {/* Mapping Table */}
      <div className="bg-white rounded-xl border border-[#E4E7EC] overflow-hidden">
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] sticky top-0 z-10 text-[11px] font-semibold text-[#667085]">
              <tr>
                <th className="px-4 py-3">Uploaded File Header</th>
                <th className="px-4 py-3">Match Confidence</th>
                <th className="px-4 py-3">Target LISTIVO Field</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {headers.map((header) => {
                const currentMappedKey = mappings[header] || 'ignore';
                const matchInfo = matchResults.find((m) => m.csvHeader === header);
                const isMapped = currentMappedKey !== 'ignore';

                return (
                  <tr key={header} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#101828] font-mono text-xs">
                      {header}
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums">
                      {matchInfo && matchInfo.confidence > 0 ? (
                        <span
                          className={`text-xs font-semibold ${
                            matchInfo.confidence >= 90 ? 'text-[#0F766E]' : 'text-amber-700'
                          }`}
                        >
                          {matchInfo.confidence}% match
                        </span>
                      ) : (
                        <span className="text-[#667085] text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={currentMappedKey}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className={`w-full max-w-sm text-xs border rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#14B8A6] transition-colors cursor-pointer ${
                          isMapped
                            ? 'border-[#14B8A6]/50 bg-[#14B8A6]/5 text-[#101828] font-medium'
                            : 'border-[#E4E7EC] bg-white text-[#667085]'
                        }`}
                      >
                        <option value="ignore">Ignore / Do Not Map</option>
                        {STANDARD_LISTIVO_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label} {f.isRequired ? '(Required)' : ''}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      {isMapped ? (
                        <span className="inline-flex items-center gap-1 text-[#0F766E] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                          <span>Mapped</span>
                        </span>
                      ) : (
                        <span className="text-[#667085]">Ignored</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Preset Modal */}
      <Modal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        title="Save Column Mapping Preset"
        subtitle={`Reuse these header mappings for future ${marketplace.toUpperCase()} catalog imports.`}
        maxWidth="md"
      >
        <form onSubmit={handleSavePresetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#101828] mb-1.5">
              Preset Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meesho Standard Seller Sheet"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full text-xs border border-[#E4E7EC] rounded-lg px-3 py-2 text-[#101828] focus:outline-none focus:border-[#14B8A6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPresetModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Preset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => onConfirmMapping(mappings)}
        >
          <span>Continue to Template Defaults</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
