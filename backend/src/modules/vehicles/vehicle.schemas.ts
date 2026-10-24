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

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
