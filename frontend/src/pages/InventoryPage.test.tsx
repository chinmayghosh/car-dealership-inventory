import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vehiclesApi } from '../api/vehicles';
import { aVehicle } from '../test/fixtures';
import { anAdmin, renderWithProviders, signInAs } from '../test/renderWithProviders';
import InventoryPage from './InventoryPage';

vi.mock('../api/vehicles');

const camry = aVehicle({ id: 'v1', make: 'Toyota', model: 'Camry XSE', price: 30000, quantity: 2 });
const camaro = aVehicle({ id: 'v2', make: 'Chevrolet', model: 'Camaro SS', price: 40000, quantity: 0 });

const rowFor = (name: string) => screen.getByRole('row', { name: new RegExp(name, 'i') });

describe('InventoryPage', () => {
  beforeEach(() => {
    signInAs(anAdmin);
    vi.mocked(vehiclesApi.list).mockResolvedValue([camry, camaro]);
  });

  it('lists every vehicle with summary stats', async () => {
    renderWithProviders(<InventoryPage />);

    expect(await screen.findByRole('row', { name: /camry xse/i })).toBeInTheDocument();
    expect(rowFor('Camaro SS')).toBeInTheDocument();
    expect(screen.getByTestId('stat-models')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-units')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-sold-out')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-value')).toHaveTextContent('$60,000');
  });

  it('adds a vehicle through the form', async () => {
    const created = aVehicle({ id: 'v3', make: 'Mazda', model: 'MX-5', category: 'Convertible' });
    vi.mocked(vehiclesApi.create).mockResolvedValue(created);
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /camry xse/i });

    await userEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    const dialog = screen.getByRole('dialog', { name: /add a vehicle/i });
    await userEvent.type(within(dialog).getByLabelText(/^make/i), 'Mazda');
    await userEvent.type(within(dialog).getByLabelText(/^model/i), 'MX-5');
    await userEvent.selectOptions(within(dialog).getByLabelText(/category/i), 'Convertible');
    await userEvent.type(within(dialog).getByLabelText(/^price/i), '30500');
    await userEvent.type(within(dialog).getByLabelText(/quantity in stock/i), '4');
    await userEvent.click(within(dialog).getByRole('button', { name: /add vehicle/i }));

    expect(vehiclesApi.create).toHaveBeenCalledWith(expect.objectContaining({ make: 'Mazda', model: 'MX-5' }));
    expect(await screen.findByRole('row', { name: /mazda mx-5/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('edits a vehicle', async () => {
    vi.mocked(vehiclesApi.update).mockResolvedValue({ ...camry, price: 27500 });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /camry xse/i });

    await userEvent.click(within(rowFor('Camry XSE')).getByRole('button', { name: /edit/i }));
    const dialog = screen.getByRole('dialog', { name: /edit toyota camry xse/i });
    const price = within(dialog).getByLabelText(/^price/i);
    await userEvent.clear(price);
    await userEvent.type(price, '27500');
    await userEvent.click(within(dialog).getByRole('button', { name: /save changes/i }));

    expect(vehiclesApi.update).toHaveBeenCalledWith('v1', expect.objectContaining({ price: 27500 }));
    expect(await within(rowFor('Camry XSE')).findByText('$27,500')).toBeInTheDocument();
  });

  it('restocks a vehicle', async () => {
    vi.mocked(vehiclesApi.restock).mockResolvedValue({ ...camaro, quantity: 5 });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /camaro ss/i });

    await userEvent.click(within(rowFor('Camaro SS')).getByRole('button', { name: /restock/i }));
    const dialog = screen.getByRole('dialog', { name: /restock chevrolet camaro ss/i });
    await userEvent.type(within(dialog).getByLabelText(/units to add/i), '5');
    await userEvent.click(within(dialog).getByRole('button', { name: /add stock/i }));

    expect(vehiclesApi.restock).toHaveBeenCalledWith('v2', 5);
    expect(await within(rowFor('Camaro SS')).findByText('5')).toBeInTheDocument();
  });

  it('deletes a vehicle only after confirmation', async () => {
    vi.mocked(vehiclesApi.remove).mockResolvedValue(undefined);
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /camry xse/i });

    await userEvent.click(within(rowFor('Camry XSE')).getByRole('button', { name: /delete/i }));
    expect(vehiclesApi.remove).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog', { name: /delete toyota camry xse/i });
    await userEvent.click(within(dialog).getByRole('button', { name: /delete vehicle/i }));

    expect(vehiclesApi.remove).toHaveBeenCalledWith('v1');
    expect(screen.queryByRole('row', { name: /camry xse/i })).not.toBeInTheDocument();
  });
});
