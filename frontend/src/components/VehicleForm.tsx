import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { CATEGORIES } from '../constants';
import { errorMessage } from '../lib/errors';
import type { Vehicle, VehicleInput } from '../types';
import { FormError } from './FormError';
import { FormField } from './FormField';

type FieldName = keyof VehicleInput;
type Values = Record<FieldName, string>;

interface VehicleFormProps {
  /** When given, the form edits this vehicle; otherwise it creates a new one. */
  initial?: Vehicle;
  submitLabel: string;
  onSubmit: (input: VehicleInput) => Promise<void>;
  onCancel: () => void;
}

const MAX_YEAR = new Date().getFullYear() + 1;

function toValues(vehicle?: Vehicle): Values {
  const text = (value: string | number | null | undefined) => (value == null ? '' : String(value));
  return {
    make: text(vehicle?.make),
    model: text(vehicle?.model),
    category: text(vehicle?.category),
    price: text(vehicle?.price),
    quantity: text(vehicle?.quantity),
    year: text(vehicle?.year),
    color: text(vehicle?.color),
    imageUrl: text(vehicle?.imageUrl),
    description: text(vehicle?.description),
  };
}

/** Mirrors the backend rules for instant feedback; the server remains the source of truth. */
function validate(values: Values): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  const price = Number(values.price);
  const quantity = Number(values.quantity);

  if (!values.make.trim()) errors.make = 'Make is required';
  if (!values.model.trim()) errors.model = 'Model is required';
  if (!values.category) errors.category = 'Choose a category';
  if (!values.price || !(price > 0)) errors.price = 'Price must be greater than 0';
  if (values.quantity === '' || !Number.isInteger(quantity) || quantity < 0) {
    errors.quantity = 'Quantity must be a whole number, 0 or more';
  }
  if (values.year && !(Number.isInteger(Number(values.year)) && Number(values.year) >= 1886 && Number(values.year) <= MAX_YEAR)) {
    errors.year = `Year must be between 1886 and ${MAX_YEAR}`;
  }
  return errors;
}

/** Converts form strings into the API payload, leaving out optional fields that were left blank. */
function toInput(values: Values): VehicleInput {
  const input: VehicleInput = {
    make: values.make.trim(),
    model: values.model.trim(),
    category: values.category,
    price: Number(values.price),
    quantity: Number(values.quantity),
  };
  if (values.year) input.year = Number(values.year);
  if (values.color.trim()) input.color = values.color.trim();
  if (values.imageUrl.trim()) input.imageUrl = values.imageUrl.trim();
  if (values.description.trim()) input.description = values.description.trim();
  return input;
}

export function VehicleForm({ initial, submitLabel, onSubmit, onCancel }: VehicleFormProps) {
  const [values, setValues] = useState<Values>(() => toValues(initial));
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bind = (name: FieldName) => ({
    value: values[name],
    error: errors[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((current) => ({ ...current, [name]: e.target.value })),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(toInput(values));
    } catch (err) {
      setFormError(errorMessage(err));
      if (err instanceof ApiError) setErrors(err.fieldErrors as Partial<Record<FieldName, string>>);
      setSubmitting(false);
    }
  }

  const category = bind('category');
  const description = bind('description');

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Make" placeholder="Toyota" {...bind('make')} />
        <FormField label="Model" placeholder="Camry" {...bind('model')} />

        <div>
          <label htmlFor="vehicle-category" className="label">
            Category
          </label>
          <select id="vehicle-category" className="input" value={category.value} onChange={category.onChange} aria-invalid={Boolean(category.error)}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {category.error && <p className="mt-1 text-xs text-red-400">{category.error}</p>}
        </div>
        <FormField label="Year" type="number" placeholder="2024" {...bind('year')} />

        <FormField label="Price ($)" type="number" min={0} step="any" placeholder="29500" {...bind('price')} />
        <FormField label="Quantity in stock" type="number" min={0} step={1} placeholder="5" {...bind('quantity')} />

        <FormField label="Color" placeholder="Pearl White" {...bind('color')} />
        <FormField label="Image URL" type="url" placeholder="https://…" {...bind('imageUrl')} />
      </div>

      <div>
        <label htmlFor="vehicle-description" className="label">
          Description
        </label>
        <textarea
          id="vehicle-description"
          rows={3}
          className="input resize-y"
          placeholder="A short description shown on the showroom card"
          value={description.value}
          onChange={description.onChange}
        />
        {description.error && <p className="mt-1 text-xs text-red-400">{description.error}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
