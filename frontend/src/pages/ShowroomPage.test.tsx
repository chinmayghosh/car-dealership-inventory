import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vehiclesApi } from '../api/vehicles';
import { aVehicle } from '../test/fixtures';
import { aUser, renderWithProviders, signInAs } from '../test/renderWithProviders';
import ShowroomPage from './ShowroomPage';

vi.mock('../api/vehicles');

const camry = aVehicle({ id: 'v1', make: 'Toyota', model: 'Camry XSE', quantity: 2 });
const camaro = aVehicle({ id: 'v2', make: 'Chevrolet', model: 'Camaro SS', quantity: 0 });

describe('ShowroomPage', () => {
  beforeEach(() => signInAs(aUser));

  it('loads and displays all vehicles', async () => {
    vi.mocked(vehiclesApi.list).mockResolvedValue([camry, camaro]);
    renderWithProviders(<ShowroomPage />);

    expect(await screen.findByRole('heading', { name: 'Toyota Camry XSE' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chevrolet Camaro SS' })).toBeInTheDocument();
    expect(screen.getByText(/2 vehicles/i)).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', async () => {
    vi.mocked(vehiclesApi.list).mockResolvedValue([]);
    renderWithProviders(<ShowroomPage />);

    expect(await screen.findByText(/no vehicles match/i)).toBeInTheDocument();
  });

  it('shows an error with a retry button when loading fails', async () => {
    vi.mocked(vehiclesApi.list).mockRejectedValueOnce(new Error('boom')).mockResolvedValue([camry]);
    renderWithProviders(<ShowroomPage />);

    await userEvent.click(await screen.findByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('heading', { name: 'Toyota Camry XSE' })).toBeInTheDocument();
  });

  it('searches with the filters after the user stops typing', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(vehiclesApi.list).mockResolvedValue([camry]);
    renderWithProviders(<ShowroomPage />);
    await screen.findByRole('heading', { name: 'Toyota Camry XSE' });

    await userEvent.type(screen.getByLabelText(/make/i), 'Toyota');
    await act(() => vi.advanceTimersByTimeAsync(400));

    expect(vehiclesApi.list).toHaveBeenLastCalledWith(expect.objectContaining({ make: 'Toyota' }));
    vi.useRealTimers();
  });

  it('updates the card stock after a successful purchase', async () => {
    vi.mocked(vehiclesApi.list).mockResolvedValue([camry]);
    vi.mocked(vehiclesApi.purchase).mockResolvedValue({ ...camry, quantity: 1 });
    renderWithProviders(<ShowroomPage />);

    const card = (await screen.findByRole('heading', { name: 'Toyota Camry XSE' })).closest('article')!;
    expect(within(card).getByText('Only 2 left')).toBeInTheDocument();

    await userEvent.click(within(card).getByRole('button', { name: /purchase/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    expect(await within(card).findByText('Only 1 left')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/purchased/i);
  });
});
