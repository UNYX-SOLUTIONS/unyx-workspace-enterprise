export const IVA_RATE_PERCENT = 15;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function toCents(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const number = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  return (cents || 0) / 100;
}

export function lineTotalCents(quantity: unknown, price: unknown): number {
  return Math.round((toCents(quantity) * toCents(price)) / 100);
}

export interface MonetaryItem {
  cantidad?: unknown;
  precio?: unknown;
}

export interface Totals {
  subtotalCents: number;
  ivaCents: number;
  totalCents: number;
  subtotal: number;
  iva: number;
  total: number;
}

export function calculateTotals(items: readonly MonetaryItem[] = []): Totals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + lineTotalCents(item.cantidad, item.precio),
    0
  );

  const ivaCents = Math.round((subtotalCents * IVA_RATE_PERCENT) / 100);
  const totalCents = subtotalCents + ivaCents;

  return {
    subtotalCents,
    ivaCents,
    totalCents,
    subtotal: fromCents(subtotalCents),
    iva: fromCents(ivaCents),
    total: fromCents(totalCents),
  };
}

export function formatCurrency(valueInCents: number): string {
  return currencyFormatter.format(fromCents(valueInCents));
}

export function validateMonetary(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  const number = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(number) || number < 0) return false;
  return Math.abs(Math.round(number * 100) - number * 100) < 1e-6;
}
