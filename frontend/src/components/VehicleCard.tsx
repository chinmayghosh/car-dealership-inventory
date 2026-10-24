import { formatPrice, stockLabel } from '../lib/format';
import type { Vehicle } from '../types';
import { VehicleImage } from './VehicleImage';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (vehicle: Vehicle) => void;
}

/** Badges sit on top of photos, so they use a near-opaque dark base to stay readable on bright images. */
function stockTone(quantity: number): string {
  if (quantity === 0) return 'bg-ink-950/85 text-red-300 ring-red-400/40';
  if (quantity <= 3) return 'bg-ink-950/85 text-gold-300 ring-gold-400/40';
  return 'bg-ink-950/85 text-emerald-300 ring-emerald-400/40';
}

export function VehicleCard({ vehicle, onPurchase }: VehicleCardProps) {
  const soldOut = vehicle.quantity === 0;
  const details = [vehicle.year, vehicle.color].filter(Boolean).join(' · ');

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 transition hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/5">
      <div className="relative overflow-hidden">
        <VehicleImage
          vehicle={vehicle}
          className={`aspect-[16/10] w-full transition duration-500 group-hover:scale-105 ${soldOut ? 'grayscale' : ''}`}
        />
        <span className="absolute top-3 left-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-semibold tracking-wide text-gold-300 backdrop-blur">
          {vehicle.category}
        </span>
        <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur ${stockTone(vehicle.quantity)}`}>
          {stockLabel(vehicle.quantity)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-white">
          {vehicle.make} {vehicle.model}
        </h3>
        {details && <p className="mt-0.5 text-sm text-ink-400">{details}</p>}
        {vehicle.description && <p className="mt-3 line-clamp-2 text-sm text-ink-400">{vehicle.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-display text-2xl text-gold-400">{formatPrice(vehicle.price)}</p>
          <button
            type="button"
            className={soldOut ? 'btn bg-ink-800 text-ink-400 ring-1 ring-ink-600' : 'btn-primary'}
            disabled={soldOut}
            onClick={() => onPurchase(vehicle)}
          >
            {soldOut ? 'Sold out' : 'Purchase'}
          </button>
        </div>
      </div>
    </article>
  );
}
