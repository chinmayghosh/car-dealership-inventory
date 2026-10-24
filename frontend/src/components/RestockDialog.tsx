import { useState, type FormEvent } from 'react';
import { vehiclesApi } from '../api/vehicles';
import { errorMessage } from '../lib/errors';
import type { Vehicle } from '../types';
import { FormError } from './FormError';
import { FormField } from './FormField';
import { Modal } from './Modal';

interface RestockDialogProps {
  vehicle: Vehicle;
  onClose: () => void;
  onRestocked: (updated: Vehicle, units: number) => void;
}

export function RestockDialog({ vehicle, onClose, onRestocked }: RestockDialogProps) {
  const [units, setUnits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const amount = Number(units);
  const valid = Number.isInteger(amount) && amount > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setError(null);
    setSubmitting(true);
    try {
      onRestocked(await vehiclesApi.restock(vehicle.id, amount), amount);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-ink-400">
          Currently <span className="font-semibold text-white">{vehicle.quantity}</span> in stock.
        </p>
        <FormField
          label="Units to add"
          type="number"
          min={1}
          step={1}
          autoFocus
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          error={units !== '' && !valid ? 'Enter a whole number of at least 1' : undefined}
        />
        {valid && (
          <p className="text-sm text-ink-400">
            New stock level: <span className="font-semibold text-gold-400">{vehicle.quantity + amount}</span>
          </p>
        )}
        <FormError message={error} />
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!valid || submitting}>
            {submitting ? 'Saving…' : 'Add stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
