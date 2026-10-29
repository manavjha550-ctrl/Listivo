import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ListingTemplate } from '../types/template';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface DeleteTemplateModalProps {
  template: ListingTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export const DeleteTemplateModal: React.FC<DeleteTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!template) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete(template.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Listing Template"
      subtitle="This action permanently removes the template."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
            Delete Template
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Confirm permanent deletion</p>
            <p className="mt-1 text-rose-700">
              Template <strong className="font-semibold text-rose-900">"{template.name}"</strong> ({template.category}) will be removed from your workspace.
            </p>
          </div>
        </div>

        {template.listingsCount && template.listingsCount > 0 ? (
          <p className="text-xs text-[#667085]">
            Note: <strong className="text-[#101828]">{template.listingsCount}</strong> existing listing(s) created from this template will remain intact in your catalog.
          </p>
        ) : null}

        {error && (
          <p className="text-xs text-rose-700 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
};
