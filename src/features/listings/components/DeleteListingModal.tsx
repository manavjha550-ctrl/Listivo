import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  count?: number;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  count = 1,
}) => {
  const isBulk = count > 1;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulk ? `Delete ${count} Product Listings` : 'Delete Product Listing'}
      subtitle="This action permanently removes the selected catalog data."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            icon={<Trash2 className="w-4 h-4" />}
          >
            {isBulk ? `Delete ${count} Listings` : 'Confirm Delete'}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isBulk
            ? `Are you sure you want to permanently remove ${count} selected listings from your catalog? All associated SKU variant rows will also be deleted.`
            : 'Are you sure you want to permanently remove this product listing from your catalog? Any associated SKU variant rows will also be deleted.'}
        </p>
      </div>
    </Modal>
  );
};
