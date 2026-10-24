import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import { aUser, renderWithProviders } from '../test/renderWithProviders';
import LoginPage from './LoginPage';

vi.mock('../api/auth');

const renderLogin = () =>
  renderWithProviders(<LoginPage />, {
    route: '/login',
    path: '/login',
    extraRoutes: [{ path: '/', element: <p>Showroom home</p> }],
  });

describe('LoginPage', () => {
  it('logs in, stores the session and goes to the showroom', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ token: 'jwt', user: aUser });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Showroom home')).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith('jane@example.com', 'secret123');
    expect(localStorage.getItem('apex.token')).toBe('jwt');
  });

  it('shows the server error when credentials are wrong', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('links to the registration page', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute('href', '/register');
  });
});
