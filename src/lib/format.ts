const LOCALE = process.env.NEXT_PUBLIC_LOCALE || 'en-BD';

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
