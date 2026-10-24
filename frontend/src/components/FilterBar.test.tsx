import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('reports make and model text', async () => {
    const onChange = vi.fn();
    render(<FilterBar onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/make/i), 'Toyota');
    await userEvent.type(screen.getByLabelText(/model/i), 'Camry');

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ make: 'Toyota', model: 'Camry' }));
  });

  it('selects a category chip and toggles it off again', async () => {
    const onChange = vi.fn();
    render(<FilterBar onChange={onChange} />);
    const suv = screen.getByRole('button', { name: 'SUV' });

    await userEvent.click(suv);
    expect(suv).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ category: 'SUV' }));

    await userEvent.click(suv);
    expect(suv).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ category: undefined }));
  });

  it('reports a numeric price range', async () => {
    const onChange = vi.fn();
    render(<FilterBar onChange={onChange} />);

    await userEvent.type(screen.getByLabelText(/min price/i), '20000');
    await userEvent.type(screen.getByLabelText(/max price/i), '50000');

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ minPrice: 20000, maxPrice: 50000 }));
  });

  it('clears every filter at once', async () => {
    const onChange = vi.fn();
    render(<FilterBar onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/make/i), 'BMW');
    await userEvent.click(screen.getByRole('button', { name: 'Coupe' }));

    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByLabelText(/make/i)).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});
