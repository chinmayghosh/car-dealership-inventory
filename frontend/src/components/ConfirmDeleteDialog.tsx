import { useState } from 'react';
import { errorMessage } from '../lib/errors';
import type { Vehicle } from '../types';
import { FormError } from './FormError';
import { Modal } from './Modal';

interface ConfirmDeleteDialogProps {
  vehicle: Vehicle;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/** Deleting is irreversible, so it always goes through an explicit confirmation. */
export function ConfirmDeleteDialog({ vehicle, onClose, onConfirm }: ConfirmDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setError(null);
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <Modal title={`Delete ${vehicle.make} ${vehicle.model}?`} onClose={onClose}>
      <p className="text-sm text-ink-400">
        This permanently removes the vehicle and its {vehicle.quantity} unit(s) of stock from the inventory. This cannot be undone.
      </p>
      <div className="mt-4">
        <FormError message={error} />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={confirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete vehicle'}
        </button>
      </div>
    </Modal>
  );
}
