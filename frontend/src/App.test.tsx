import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vehiclesApi } from './api/vehicles';
import App from './App';
import { anAdmin, aUser, signInAs } from './test/renderWithProviders';

vi.mock('./api/vehicles');

const renderApp = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

describe('App routing', () => {
  beforeEach(() => vi.mocked(vehiclesApi.list).mockResolvedValue([]));

  it('sends a logged-out visitor to the login page', () => {
    renderApp('/');

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('shows the showroom without an Inventory link to a customer', async () => {
    signInAs(aUser);
    renderApp('/');

    expect(await screen.findByRole('heading', { name: /drive something extraordinary/i })).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Inventory' })).not.toBeInTheDocument();
  });

  it('gives an admin the Inventory link and page', async () => {
    signInAs(anAdmin);
    renderApp('/');

    await userEvent.click(screen.getByRole('link', { name: 'Inventory' }));

    expect(await screen.findByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
  });

  it('redirects a signed-in user away from the login page', async () => {
    signInAs(aUser);
    renderApp('/login');

    expect(await screen.findByRole('heading', { name: /drive something extraordinary/i })).toBeInTheDocument();
  });

  it('logs out and returns to the login page', async () => {
    signInAs(aUser);
    renderApp('/');

    await userEvent.click(screen.getByRole('button', { name: /log out/i }));

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(localStorage.getItem('apex.token')).toBeNull();
  });

  it('shows a 404 page for unknown routes', () => {
    signInAs(aUser);
    renderApp('/nowhere');

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
