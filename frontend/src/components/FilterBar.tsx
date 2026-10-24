import { useState } from 'react';
import { CATEGORIES } from '../constants';
import type { VehicleFilters } from '../types';

interface FilterState {
  make: string;
  model: string;
  category?: string;
  minPrice: string;
  maxPrice: string;
}

const EMPTY: FilterState = { make: '', model: '', category: undefined, minPrice: '', maxPrice: '' };

const toNumber = (value: string) => (value.trim() === '' ? undefined : Number(value));

/** Converts raw form state into API filters, with empty fields left undefined. */
function toFilters(state: FilterState): VehicleFilters {
  return {
    make: state.make.trim() || undefined,
    model: state.model.trim() || undefined,
    category: state.category,
    minPrice: toNumber(state.minPrice),
    maxPrice: toNumber(state.maxPrice),
  };
}

/** Search box for make/model, category chips and a price range. Reports every change immediately. */
export function FilterBar({ onChange }: { onChange: (filters: VehicleFilters) => void }) {
  const [state, setState] = useState<FilterState>(EMPTY);

  const apply = (next: FilterState) => {
    setState(next);
    onChange(toFilters(next));
  };
  const set = (key: keyof FilterState) => (e: React.ChangeEvent<HTMLInputElement>) => apply({ ...state, [key]: e.target.value });

  const hasFilters = JSON.stringify(state) !== JSON.stringify(EMPTY);

  return (
    <section aria-label="Search and filter vehicles" className="rounded-2xl border border-ink-700 bg-ink-900/80 p-4 backdrop-blur sm:p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="filter-make" className="label">
            Make
          </label>
          <input id="filter-make" className="input" placeholder="e.g. Toyota" value={state.make} onChange={set('make')} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="filter-model" className="label">
            Model
          </label>
          <input id="filter-model" className="input" placeholder="e.g. Camry" value={state.model} onChange={set('model')} />
        </div>
        <div>
          <label htmlFor="filter-min" className="label">
            Min price ($)
          </label>
          <input id="filter-min" className="input" type="number" min={0} inputMode="numeric" placeholder="No min" value={state.minPrice} onChange={set('minPrice')} />
        </div>
        <div>
          <label htmlFor="filter-max" className="label">
            Max price ($)
          </label>
          <input id="filter-max" className="input" type="number" min={0} inputMode="numeric" placeholder="No max" value={state.maxPrice} onChange={set('maxPrice')} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => {
          const active = state.category === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              onClick={() => apply({ ...state, category: active ? undefined : category })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                active ? 'bg-gold-400 text-ink-950' : 'bg-ink-800 text-ink-200 ring-1 ring-ink-600 hover:ring-gold-500/60'
              }`}
            >
              {category}
            </button>
          );
        })}
        {hasFilters && (
          <button type="button" onClick={() => apply(EMPTY)} className="ml-auto text-xs font-semibold text-gold-400 hover:text-gold-300">
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
