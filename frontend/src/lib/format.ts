const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return usd.format(amount);
}

/** At or below this many units we show an urgency label instead of the raw count. */
const LOW_STOCK_THRESHOLD = 3;

export function stockLabel(quantity: number): string {
  if (quantity === 0) return 'Sold out';
  if (quantity <= LOW_STOCK_THRESHOLD) return `Only ${quantity} left`;
  return `${quantity} in stock`;
}
