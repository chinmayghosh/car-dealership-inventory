import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import { aUser, renderWithProviders } from '../test/renderWithProviders';
import RegisterPage from './RegisterPage';

vi.mock('../api/auth');

const renderRegister = () =>
  renderWithProviders(<RegisterPage />, {
    route: '/register',
    path: '/register',
    extraRoutes: [{ path: '/', element: <p>Showroom home</p> }],
  });

async function fillForm({ name = 'Jane Doe', email = 'jane@example.com', password = 'secret123', confirm = password } = {}) {
  await userEvent.type(screen.getByLabelText(/full name/i), name);
  await userEvent.type(screen.getByLabelText(/^email/i), email);
  await userEvent.type(screen.getByLabelText(/^password/i), password);
  await userEvent.type(screen.getByLabelText(/confirm password/i), confirm);
  await userEvent.click(screen.getByRole('button', { name: /create account/i }));
}

describe('RegisterPage', () => {
  it('registers, signs the user in and goes to the showroom', async () => {
    vi.mocked(authApi.register).mockResolvedValue({ token: 'jwt', user: aUser });
    renderRegister();

    await fillForm();

    expect(await screen.findByText('Showroom home')).toBeInTheDocument();
    expect(authApi.register).toHaveBeenCalledWith('Jane Doe', 'jane@example.com', 'secret123');
  });

  it('blocks submission when the passwords do not match', async () => {
    renderRegister();

    await fillForm({ password: 'secret123', confirm: 'different' });

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('blocks submission when the password is too short', async () => {
    renderRegister();

    await fillForm({ password: '123' });

    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('shows the server error, e.g. for an email that is already registered', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new ApiError(409, 'Email is already registered'));
    renderRegister();

    await fillForm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Email is already registered');
  });
});
