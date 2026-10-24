import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { aVehicle } from '../test/fixtures';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  it('shows the key details of the vehicle', () => {
    render(<VehicleCard vehicle={aVehicle()} onPurchase={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Toyota Camry XSE' })).toBeInTheDocument();
    expect(screen.getByText('$29,500')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText(/2023/)).toBeInTheDocument();
    expect(screen.getByText('8 in stock')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Toyota Camry XSE' })).toHaveAttribute('src', 'https://example.com/camry.jpg');
  });

  it('calls onPurchase with the vehicle when Purchase is clicked', async () => {
    const onPurchase = vi.fn();
    const vehicle = aVehicle();
    render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />);

    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));

    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('disables the Purchase button and shows Sold out when quantity is zero', async () => {
    const onPurchase = vi.fn();
    render(<VehicleCard vehicle={aVehicle({ quantity: 0 })} onPurchase={onPurchase} />);

    const button = screen.getByRole('button', { name: /sold out/i });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onPurchase).not.toHaveBeenCalled();
  });

  it('warns when stock is low', () => {
    render(<VehicleCard vehicle={aVehicle({ quantity: 2 })} onPurchase={vi.fn()} />);

    expect(screen.getByText('Only 2 left')).toBeInTheDocument();
  });

  it('falls back to a placeholder when there is no image', () => {
    render(<VehicleCard vehicle={aVehicle({ imageUrl: null })} onPurchase={vi.fn()} />);

    expect(screen.queryByRole('img', { name: 'Toyota Camry XSE' })).not.toBeInTheDocument();
    expect(screen.getByTestId('image-placeholder')).toBeInTheDocument();
  });
});
