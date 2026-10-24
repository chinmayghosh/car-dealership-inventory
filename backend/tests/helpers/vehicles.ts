import { prisma } from './db';

/** A well-formed id that never matches a stored vehicle. */
export const MISSING_ID = '00000000-0000-0000-0000-000000000000';

/** Builds valid vehicle input; override only the fields a test cares about. */
export function aVehicle(overrides: Record<string, unknown> = {}) {
  return {
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 27000,
    quantity: 5,
    year: 2024,
    color: 'Silver',
    imageUrl: 'https://example.com/camry.jpg',
    description: 'Reliable mid-size sedan',
    ...overrides,
  };
}

/** Inserts a vehicle straight into the database, bypassing the API. */
export function insertVehicle(overrides: Record<string, unknown> = {}) {
  return prisma.vehicle.create({ data: aVehicle(overrides) as ReturnType<typeof aVehicle> });
}
