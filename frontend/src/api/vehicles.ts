import type { Vehicle, VehicleFilters, VehicleInput } from '../types';
import { apiRequest } from './client';

/** Drops empty filters so only meaningful ones reach the query string. */
function toQueryString(filters: VehicleFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value).trim());
  }
  return params.toString();
}

export const vehiclesApi = {
  /** Uses the search endpoint when any filter is set, otherwise lists everything. */
  list(filters: VehicleFilters = {}) {
    const query = toQueryString(filters);
    return apiRequest<Vehicle[]>(query ? `/api/vehicles/search?${query}` : '/api/vehicles');
  },

  create: (input: VehicleInput) => apiRequest<Vehicle>('/api/vehicles', { method: 'POST', body: input }),

  update: (id: string, input: Partial<VehicleInput>) =>
    apiRequest<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: input }),

  remove: (id: string) => apiRequest<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),

  purchase: (id: string, quantity: number) =>
    apiRequest<Vehicle>(`/api/vehicles/${id}/purchase`, { method: 'POST', body: { quantity } }),

  restock: (id: string, quantity: number) =>
    apiRequest<Vehicle>(`/api/vehicles/${id}/restock`, { method: 'POST', body: { quantity } }),
};
