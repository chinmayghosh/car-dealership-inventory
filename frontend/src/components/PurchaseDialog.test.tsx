import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../api/client';
import { vehiclesApi } from '../api/vehicles';
import { aVehicle } from '../test/fixtures';
import { PurchaseDialog } from './PurchaseDialog';

vi.mock('../api/vehicles');

describe('PurchaseDialog', () => {
  const vehicle = aVehicle({ quantity: 3, price: 20000 });

  it('starts at one unit and shows the total price', () => {
    render(<PurchaseDialog vehicle={vehicle} onClose={vi.fn()} onPurchased={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: /purchase toyota camry xse/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(1);
    expect(screen.getByTestId('purchase-total')).toHaveTextContent('$20,000');
  });

  it('updates the total as the quantity changes and caps it at the available stock', async () => {
    render(<PurchaseDialog vehicle={vehicle} onClose={vi.fn()} onPurchased={vi.fn()} />);
    const increase = screen.getByRole('button', { name: /increase quantity/i });

    await userEvent.click(increase);
    expect(screen.getByTestId('purchase-total')).toHaveTextContent('$40,000');

    await userEvent.click(increase);
    await userEvent.click(increase);
    expect(screen.getByLabelText(/quantity/i)).toHaveValue(3);
    expect(increase).toBeDisabled();
  });

  it('never goes below one unit', () => {
    render(<PurchaseDialog vehicle={vehicle} onClose={vi.fn()} onPurchased={vi.fn()} />);

    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
  });

  it('purchases the chosen quantity and reports the updated vehicle', async () => {
    const updated = { ...vehicle, quantity: 1 };
    vi.mocked(vehiclesApi.purchase).mockResolvedValue(updated);
    const onPurchased = vi.fn();
    render(<PurchaseDialog vehicle={vehicle} onClose={vi.fn()} onPurchased={onPurchased} />);

    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    expect(vehiclesApi.purchase).toHaveBeenCalledWith('v1', 2);
    expect(onPurchased).toHaveBeenCalledWith(updated, 2);
  });

  it('shows the server error and stays open if the purchase fails', async () => {
    vi.mocked(vehiclesApi.purchase).mockRejectedValue(new ApiError(409, 'Only 1 left in stock'));
    const onPurchased = vi.fn();
    render(<PurchaseDialog vehicle={vehicle} onClose={vi.fn()} onPurchased={onPurchased} />);

    await userEvent.click(screen.getByRole('button', { name: /confirm purchase/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 1 left in stock');
    expect(onPurchased).not.toHaveBeenCalled();
  });

  it('closes on Cancel and on Escape', async () => {
    const onClose = vi.fn();
    render(<PurchaseDialog vehicle={vehicle} onClose={onClose} onPurchased={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
