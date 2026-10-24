import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { aVehicle } from '../test/fixtures';
import { VehicleForm } from './VehicleForm';

async function fillRequired() {
  await userEvent.type(screen.getByLabelText(/^make/i), 'Mazda');
  await userEvent.type(screen.getByLabelText(/^model/i), 'MX-5');
  await userEvent.selectOptions(screen.getByLabelText(/category/i), 'Convertible');
  await userEvent.type(screen.getByLabelText(/^price/i), '30500');
  await userEvent.type(screen.getByLabelText(/quantity in stock/i), '4');
}

describe('VehicleForm', () => {
  it('submits typed values, converting numbers and dropping empty optional fields', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<VehicleForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Add vehicle" />);

    await fillRequired();
    await userEvent.type(screen.getByLabelText(/year/i), '2024');
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    expect(onSubmit).toHaveBeenCalledWith({
      make: 'Mazda',
      model: 'MX-5',
      category: 'Convertible',
      price: 30500,
      quantity: 4,
      year: 2024,
    });
  });

  it('shows required-field errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn();
    render(<VehicleForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Add vehicle" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    expect(screen.getByText('Make is required')).toBeInTheDocument();
    expect(screen.getByText('Model is required')).toBeInTheDocument();
    expect(screen.getByText('Choose a category')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('is prefilled when editing an existing vehicle', () => {
    render(<VehicleForm initial={aVehicle()} onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Save changes" />);

    expect(screen.getByLabelText(/^make/i)).toHaveValue('Toyota');
    expect(screen.getByLabelText(/^price/i)).toHaveValue(29500);
    expect(screen.getByLabelText(/category/i)).toHaveValue('Sedan');
  });

  it('shows field errors returned by the server', async () => {
    const { ApiError } = await import('../api/client');
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(400, 'Validation failed', { imageUrl: 'Image URL must be a valid URL' }));
    render(<VehicleForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Add vehicle" />);

    await fillRequired();
    await userEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    expect(await screen.findByText('Image URL must be a valid URL')).toBeInTheDocument();
  });
});
