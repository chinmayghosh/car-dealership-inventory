import { apiRequest } from './client';
import { vehiclesApi } from './vehicles';

vi.mock('./client', () => ({ apiRequest: vi.fn() }));

describe('vehiclesApi', () => {
  it('lists everything from /api/vehicles when no filters are set', async () => {
    await vehiclesApi.list();
    await vehiclesApi.list({ make: '', model: undefined });

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/api/vehicles');
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/api/vehicles');
  });

  it('uses the search endpoint with only the filters that are set', async () => {
    await vehiclesApi.list({ make: ' Toyota ', category: 'SUV', minPrice: 0, maxPrice: 50000 });

    expect(apiRequest).toHaveBeenCalledWith('/api/vehicles/search?make=Toyota&category=SUV&minPrice=0&maxPrice=50000');
  });

  it('maps each mutation to the right endpoint and method', async () => {
    const input = { make: 'BMW', model: 'M4', category: 'Coupe', price: 1, quantity: 1 };
    await vehiclesApi.create(input);
    await vehiclesApi.update('v1', { price: 2 });
    await vehiclesApi.remove('v1');
    await vehiclesApi.purchase('v1', 2);
    await vehiclesApi.restock('v1', 5);

    expect(vi.mocked(apiRequest).mock.calls).toEqual([
      ['/api/vehicles', { method: 'POST', body: input }],
      ['/api/vehicles/v1', { method: 'PUT', body: { price: 2 } }],
      ['/api/vehicles/v1', { method: 'DELETE' }],
      ['/api/vehicles/v1/purchase', { method: 'POST', body: { quantity: 2 } }],
      ['/api/vehicles/v1/restock', { method: 'POST', body: { quantity: 5 } }],
    ]);
  });
});
