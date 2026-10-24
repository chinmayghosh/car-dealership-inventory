import { useCallback, useEffect, useRef, useState } from 'react';
import { vehiclesApi } from '../api/vehicles';
import { FilterBar } from '../components/FilterBar';
import { PurchaseDialog } from '../components/PurchaseDialog';
import { VehicleCard } from '../components/VehicleCard';
import { useToast } from '../context/ToastContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { errorMessage } from '../lib/errors';
import type { Vehicle, VehicleFilters } from '../types';

const SEARCH_DELAY_MS = 300;

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
      <div className="aspect-[16/10] bg-ink-800" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-ink-800" />
        <div className="h-4 w-1/3 rounded bg-ink-800" />
        <div className="h-8 w-1/2 rounded bg-ink-800" />
      </div>
    </div>
  );
}

export default function ShowroomPage() {
  const { notify } = useToast();
  const [filters, setFilters] = useState<VehicleFilters>({});
  const debouncedFilters = useDebouncedValue(filters, SEARCH_DELAY_MS);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<Vehicle | null>(null);
  // Only the latest search may update the list, so slow, stale responses are ignored.
  const latestRequest = useRef(0);

  const load = useCallback(async (activeFilters: VehicleFilters) => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await vehiclesApi.list(activeFilters);
      if (requestId === latestRequest.current) setVehicles(result);
    } catch (err) {
      if (requestId === latestRequest.current) setError(errorMessage(err));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(debouncedFilters);
  }, [debouncedFilters, load]);

  const handlePurchased = (updated: Vehicle, quantity: number) => {
    setVehicles((current) => current.map((v) => (v.id === updated.id ? updated : v)));
    setPurchasing(null);
    notify(`Purchased ${quantity} × ${updated.make} ${updated.model}. Enjoy the drive!`);
  };

  const closeDialog = useCallback(() => setPurchasing(null), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">The Showroom</p>
        <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Drive something extraordinary</h1>
        <p className="mt-3 max-w-2xl text-ink-400">Browse our current inventory, filter by what matters to you and purchase in a couple of clicks.</p>
      </header>

      <FilterBar onChange={setFilters} />

      <div className="mt-8 mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-400" aria-live="polite">
          {!loading && !error && `Showing ${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center">
          <p className="text-red-300">{error}</p>
          <button type="button" className="btn-ghost mt-4" onClick={() => load(filters)}>
            Try again
          </button>
        </div>
      ) : loading && vehicles.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading vehicles">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600 p-16 text-center">
          <p className="font-display text-2xl text-white">No vehicles match your search</p>
          <p className="mt-2 text-sm text-ink-400">Try a different make, model or price range.</p>
        </div>
      ) : (
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60 transition' : ''}`}>
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onPurchase={setPurchasing} />
          ))}
        </div>
      )}

      {purchasing && <PurchaseDialog vehicle={purchasing} onClose={closeDialog} onPurchased={handlePurchased} />}
    </div>
  );
}
