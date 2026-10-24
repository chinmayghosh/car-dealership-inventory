import { formatPrice, stockLabel } from './format';

describe('formatPrice', () => {
  it('formats whole dollars with thousands separators and no cents', () => {
    expect(formatPrice(29500)).toBe('$29,500');
    expect(formatPrice(3500000)).toBe('$3,500,000');
  });

  it('rounds fractional amounts to the nearest dollar', () => {
    expect(formatPrice(1999.6)).toBe('$2,000');
  });
});

describe('stockLabel', () => {
  it('says sold out at zero', () => {
    expect(stockLabel(0)).toBe('Sold out');
  });

  it('warns when only a few are left', () => {
    expect(stockLabel(1)).toBe('Only 1 left');
    expect(stockLabel(3)).toBe('Only 3 left');
  });

  it('shows the count when stock is healthy', () => {
    expect(stockLabel(4)).toBe('4 in stock');
  });
});
