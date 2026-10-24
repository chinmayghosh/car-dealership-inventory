import type { AuthResponse } from '../types';
import { apiRequest } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } }),

  register: (name: string, email: string, password: string) =>
    apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password } }),
};
