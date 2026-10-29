import React, { useState } from 'react';
import { STANDARD_LISTIVO_FIELDS } from '../services/standardFields';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface BulkEditModalProps {
  selectedRowIndices: number[];
  onApplyBulkEdit: (fieldKey: string, newValue: any) => void;
  onClose: () => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  selectedRowIndices,
  onApplyBulkEdit,
  onClose,
}) => {
  const [selectedField, setSelectedField] = useState<string>('brand');
  const [newValue, setNewValue] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const currentFieldDef = STANDARD_LISTIVO_FIELDS.find((f) => f.key === selectedField);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onApplyBulkEdit(selectedField, newValue);
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Bulk Edit ${selectedRowIndices.length} Selected Rows`}
      subtitle="Apply a uniform field value across all selected spreadsheet rows."
      maxWidth="md"
    >
      {!showConfirm ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#101828] mb-1.5">
              Field to Update
            </label>
            <select
              value={selectedField}
              onChange={(e) => {
                setSelectedField(e.target.value);
                setNewValue('');
              }}
              className="w-full text-xs border border-[#E4E7EC] rounded-lg px-3 py-2 bg-[#F8FAFC] text-[#101828] focus:bg-white focus:border-[#14B8A6] focus:outline-none cursor-pointer"
            >
              {STANDARD_LISTIVO_FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#101828] mb-1.5">
              New Value for {currentFieldDef?.label}
            </label>

            {currentFieldDef?.type === 'dropdown' && currentFieldDef.options ? (
              <select
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full text-xs border border-[#E4E7EC] rounded-lg px-3 py-2 bg-[#F8FAFC] text-[#101828] focus:bg-white focus:border-[#14B8A6] focus:outline-none cursor-pointer"
              >
                <option value="">Select value...</option>
                {currentFieldDef.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={currentFieldDef?.type === 'number' ? 'number' : 'text'}
                required
                placeholder={`Enter new ${currentFieldDef?.label}...`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full text-xs border border-[#E4E7EC] rounded-lg px-3 py-2 bg-[#F8FAFC] text-[#101828] focus:bg-white focus:border-[#14B8A6] focus:outline-none"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Review Change
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4" /> Confirm Bulk Update
            </p>
            <p>
              Set <strong className="font-semibold">{currentFieldDef?.label}</strong> to{' '}
              <strong className="font-semibold">"{newValue}"</strong> across{' '}
              <strong className="font-mono tabular-nums font-semibold">
                {selectedRowIndices.length}
              </strong>{' '}
              rows?
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
            >
              Back
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
              Apply Update
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
