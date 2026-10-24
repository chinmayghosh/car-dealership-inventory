import { useState } from 'react';
import { vehiclesApi } from '../api/vehicles';
import { errorMessage } from '../lib/errors';
import { formatPrice, stockLabel } from '../lib/format';
import type { Vehicle } from '../types';
import { FormError } from './FormError';
import { Modal } from './Modal';
import { VehicleImage } from './VehicleImage';

interface PurchaseDialogProps {
  vehicle: Vehicle;
  onClose: () => void;
  onPurchased: (updated: Vehicle, quantity: number) => void;
}

/** Confirms a purchase: pick a quantity (1..stock), see the total, then confirm. */
export function PurchaseDialog({ vehicle, onClose, onPurchased }: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const max = vehicle.quantity;
  const name = `${vehicle.make} ${vehicle.model}`;

  const clamp = (value: number) => Math.min(max, Math.max(1, Math.floor(value) || 1));

  async function confirm() {
    setError(null);
    setSubmitting(true);
    try {
      const updated = await vehiclesApi.purchase(vehicle.id, quantity);
      onPurchased(updated, quantity);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Purchase ${name}`} onClose={onClose}>
      <div className="flex gap-4">
        <VehicleImage vehicle={vehicle} className="h-20 w-28 shrink-0 rounded-lg" />
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-ink-400">
            {formatPrice(vehicle.price)} each · {stockLabel(vehicle.quantity)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="purchase-quantity" className="label">
          Quantity
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost h-10 w-10 p-0 text-lg"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => clamp(q - 1))}
          >
            −
          </button>
          <input
            id="purchase-quantity"
            type="number"
            min={1}
            max={max}
            value={quantity}
            onChange={(e) => setQuantity(clamp(Number(e.target.value)))}
            className="input h-10 w-20 text-center"
          />
          <button
            type="button"
            className="btn-ghost h-10 w-10 p-0 text-lg"
            aria-label="Increase quantity"
            disabled={quantity >= max}
            onClick={() => setQuantity((q) => clamp(q + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-ink-800 px-4 py-3">
        <span className="text-sm text-ink-400">Total</span>
        <span data-testid="purchase-total" className="font-display text-2xl text-gold-400">
          {formatPrice(vehicle.price * quantity)}
        </span>
      </div>

      <div className="mt-4">
        <FormError message={error} />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={confirm} disabled={submitting}>
          {submitting ? 'Processing…' : 'Confirm purchase'}
        </button>
      </div>
    </Modal>
  );
}
