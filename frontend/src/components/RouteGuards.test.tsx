import { screen } from '@testing-library/react';
import { anAdmin, aUser, renderWithProviders, signInAs } from '../test/renderWithProviders';
import { AdminRoute, ProtectedRoute } from './RouteGuards';

const redirectTargets = [
  { path: '/login', element: <p>Login page</p> },
  { path: '/', element: <p>Showroom home</p> },
];

describe('ProtectedRoute', () => {
  it('sends logged-out visitors to the login page', () => {
    renderWithProviders(<ProtectedRoute><p>Secret</p></ProtectedRoute>, {
      route: '/secret',
      path: '/secret',
      extraRoutes: redirectTargets,
    });

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('renders the page for a logged-in user', () => {
    signInAs(aUser);
    renderWithProviders(<ProtectedRoute><p>Secret</p></ProtectedRoute>, { route: '/secret', path: '/secret' });

    expect(screen.getByText('Secret')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('sends regular users back to the showroom', () => {
    signInAs(aUser);
    renderWithProviders(<AdminRoute><p>Inventory admin</p></AdminRoute>, {
      route: '/admin',
      path: '/admin',
      extraRoutes: redirectTargets,
    });

    expect(screen.getByText('Showroom home')).toBeInTheDocument();
  });

  it('renders the page for an admin', () => {
    signInAs(anAdmin);
    renderWithProviders(<AdminRoute><p>Inventory admin</p></AdminRoute>, { route: '/admin', path: '/admin' });

    expect(screen.getByText('Inventory admin')).toBeInTheDocument();
  });
});
