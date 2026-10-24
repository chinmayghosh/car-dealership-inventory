import { useState } from 'react';
import type { Vehicle } from '../types';

/** The vehicle photo, or a branded placeholder if there is no image or it fails to load. */
export function VehicleImage({ vehicle, className = '' }: { vehicle: Vehicle; className?: string }) {
  const [failed, setFailed] = useState(false);
  const name = `${vehicle.make} ${vehicle.model}`;

  if (!vehicle.imageUrl || failed) {
    return (
      <div
        data-testid="image-placeholder"
        className={`flex items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900 ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-ink-600" fill="currentColor" aria-hidden="true">
          <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4a2 2 0 0 1 2-2Zm2.1 0h9.8l-1.2-3.6a.5.5 0 0 0-.5-.4H8.8a.5.5 0 0 0-.5.4L7.1 11ZM7 15.5A1.5 1.5 0 1 0 7 12.5a1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      </div>
    );
  }

  return <img src={vehicle.imageUrl} alt={name} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
