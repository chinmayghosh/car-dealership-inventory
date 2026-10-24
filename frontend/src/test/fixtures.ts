import type { Vehicle } from '../types';

export function aVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    make: 'Toyota',
    model: 'Camry XSE',
    category: 'Sedan',
    price: 29500,
    quantity: 8,
    year: 2023,
    color: 'Celestial Grey',
    imageUrl: 'https://example.com/camry.jpg',
    description: 'Sporty mid-size sedan.',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}
