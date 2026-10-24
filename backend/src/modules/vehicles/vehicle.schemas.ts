import { z } from 'zod';

/** The fixed set of categories the dealership sells. Shared with the frontend dropdown. */
export const VEHICLE_CATEGORIES = [
  'Sedan',
  'SUV',
  'Truck',
  'Coupe',
  'Hatchback',
  'Convertible',
  'EV',
  'Van',
] as const;

const MAX_YEAR = new Date().getFullYear() + 1;

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required').max(50),
  model: z.string().trim().min(1, 'Model is required').max(50),
  category: z.enum(VEHICLE_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${VEHICLE_CATEGORIES.join(', ')}` }),
  }),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
  year: z.number().int().min(1886, 'Year is not plausible').max(MAX_YEAR, 'Year is not plausible').optional(),
  color: z.string().trim().max(30).optional(),
  imageUrl: z.string().trim().url('Image URL must be a valid URL').optional(),
  description: z.string().trim().max(1000).optional(),
});

/** Partial update: any subset of the create fields, but at least one. */
export const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' });

const units = z.number().int('Quantity must be a whole number').positive('Quantity must be at least 1');

/** Purchase body is optional; buying one unit is the default. */
export const purchaseSchema = z.object({ quantity: units.default(1) });

const optionalPrice = z.coerce.number().nonnegative('Price cannot be negative').optional();

/** Query-string filters for search. Text filters are partial, case-insensitive matches. */
export const searchVehicleSchema = z
  .object({
    make: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    category: z.enum(VEHICLE_CATEGORIES).optional(),
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: 'minPrice cannot be greater than maxPrice',
    path: ['minPrice'],
  });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleSearchFilters = z.infer<typeof searchVehicleSchema>;
