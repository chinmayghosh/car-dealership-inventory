export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number | null;
  color: string | null;
  imageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields an admin can submit when creating or editing a vehicle. */
export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  color?: string;
  imageUrl?: string;
  description?: string;
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
