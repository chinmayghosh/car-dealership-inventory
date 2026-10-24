import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import type { User } from '../types';

export const aUser: User = { id: 'u1', name: 'Jane Doe', email: 'jane@example.com', role: 'USER' };
export const anAdmin: User = { id: 'a1', name: 'Admin', email: 'admin@dealership.com', role: 'ADMIN' };

/** Simulates a stored session so components render as a logged-in user. */
export function signInAs(user: User) {
  localStorage.setItem('apex.token', 'test-token');
  localStorage.setItem('apex.user', JSON.stringify(user));
}

interface Options {
  route?: string;
  /** Extra routes so tests can assert where a redirect landed. */
  extraRoutes?: { path: string; element: ReactElement }[];
  path?: string;
}

/** Renders a component inside the router, auth and toast providers used by the real app. */
export function renderWithProviders(ui: ReactElement, { route = '/', path = '*', extraRoutes = [] }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path={path} element={ui} />
            {extraRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}
