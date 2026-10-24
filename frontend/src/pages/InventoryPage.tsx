import { useCallback, useEffect, useMemo, useState } from 'react';
import { vehiclesApi } from '../api/vehicles';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { Modal } from '../components/Modal';
import { RestockDialog } from '../components/RestockDialog';
import { VehicleForm } from '../components/VehicleForm';
import { VehicleImage } from '../components/VehicleImage';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../lib/errors';
import { formatPrice } from '../lib/format';
import type { Vehicle, VehicleInput } from '../types';

/** Which dialog is open, and for which vehicle. Only one can be open at a time. */
type DialogState =
  | { kind: 'add' }
  | { kind: 'edit'; vehicle: Vehicle }
  | { kind: 'restock'; vehicle: Vehicle }
  | { kind: 'delete'; vehicle: Vehicle }
  | null;

function Stat({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">{label}</p>
      <p data-testid={testId} className="mt-2 font-display text-3xl text-white">
        {value}
      </p>
    </div>
  );
}

function StockBadge({ quantity }: { quantity: number }) {
  const tone =
    quantity === 0 ? 'bg-red-500/15 text-red-300' : quantity <= 3 ? 'bg-gold-400/15 text-gold-300' : 'bg-emerald-500/15 text-emerald-300';
  return <span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{quantity}</span>;
}

/** Admin-only inventory management: add, edit, restock and delete vehicles. */
export default function InventoryPage() {
  const { notify } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await vehiclesApi.list());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      models: vehicles.length,
      units: vehicles.reduce((sum, v) => sum + v.quantity, 0),
      soldOut: vehicles.filter((v) => v.quantity === 0).length,
      value: vehicles.reduce((sum, v) => sum + v.price * v.quantity, 0),
    }),
    [vehicles],
  );

  const closeDialog = useCallback(() => setDialog(null), []);
  const replace = (updated: Vehicle) => setVehicles((current) => current.map((v) => (v.id === updated.id ? updated : v)));

  async function handleCreate(input: VehicleInput) {
    const created = await vehiclesApi.create(input);
    setVehicles((current) => [created, ...current]);
    setDialog(null);
    notify(`${created.make} ${created.model} added to the inventory.`);
  }

  async function handleUpdate(id: string, input: VehicleInput) {
    const updated = await vehiclesApi.update(id, input);
    replace(updated);
    setDialog(null);
    notify(`${updated.make} ${updated.model} updated.`);
  }

  async function handleDelete(vehicle: Vehicle) {
    await vehiclesApi.remove(vehicle.id);
    setVehicles((current) => current.filter((v) => v.id !== vehicle.id));
    setDialog(null);
    notify(`${vehicle.make} ${vehicle.model} deleted.`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Admin</p>
          <h1 className="mt-2 font-display text-4xl text-white">Inventory</h1>
          <p className="mt-2 text-ink-400">Add new arrivals, adjust details and keep stock levels up to date.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setDialog({ kind: 'add' })}>
          <span aria-hidden="true">+</span> Add vehicle
        </button>
      </header>

      <section aria-label="Inventory summary" className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Models" value={String(stats.models)} testId="stat-models" />
        <Stat label="Units in stock" value={String(stats.units)} testId="stat-units" />
        <Stat label="Sold out" value={String(stats.soldOut)} testId="stat-sold-out" />
        <Stat label="Stock value" value={formatPrice(stats.value)} testId="stat-value" />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-red-300">{error}</p>
            <button type="button" className="btn-ghost mt-4" onClick={load}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <p className="p-10 text-center text-ink-400" aria-busy="true">
            Loading inventory…
          </p>
        ) : vehicles.length === 0 ? (
          <p className="p-10 text-center text-ink-400">The inventory is empty. Add your first vehicle to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-ink-700 text-xs tracking-wide text-ink-400 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Vehicle</th>
                  <th scope="col" className="px-5 py-3 font-medium">Category</th>
                  <th scope="col" className="px-5 py-3 font-medium">Price</th>
                  <th scope="col" className="px-5 py-3 font-medium">Stock</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="transition hover:bg-ink-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <VehicleImage vehicle={vehicle} className="h-10 w-16 shrink-0 rounded-md" />
                        <div>
                          <p className="font-medium text-white">
                            {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-xs text-ink-400">{[vehicle.year, vehicle.color].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-200">{vehicle.category}</td>
                    <td className="px-5 py-3 text-ink-200">{formatPrice(vehicle.price)}</td>
                    <td className="px-5 py-3">
                      <StockBadge quantity={vehicle.quantity} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setDialog({ kind: 'restock', vehicle })}>
                          Restock
                        </button>
                        <button type="button" className="btn-ghost px-3 py-1.5" onClick={() => setDialog({ kind: 'edit', vehicle })}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn px-3 py-1.5 text-red-300 hover:bg-red-500/10"
                          onClick={() => setDialog({ kind: 'delete', vehicle })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dialog?.kind === 'add' && (
        <Modal title="Add a vehicle" onClose={closeDialog} size="max-w-2xl">
          <VehicleForm submitLabel="Add vehicle" onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.kind === 'edit' && (
        <Modal title={`Edit ${dialog.vehicle.make} ${dialog.vehicle.model}`} onClose={closeDialog} size="max-w-2xl">
          <VehicleForm
            initial={dialog.vehicle}
            submitLabel="Save changes"
            onSubmit={(input) => handleUpdate(dialog.vehicle.id, input)}
            onCancel={closeDialog}
          />
        </Modal>
      )}
      {dialog?.kind === 'restock' && (
        <RestockDialog
          vehicle={dialog.vehicle}
          onClose={closeDialog}
          onRestocked={(updated, units) => {
            replace(updated);
            setDialog(null);
            notify(`Added ${units} unit(s) of ${updated.make} ${updated.model}.`);
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDeleteDialog vehicle={dialog.vehicle} onClose={closeDialog} onConfirm={() => handleDelete(dialog.vehicle)} />
      )}
    </div>
  );
}
