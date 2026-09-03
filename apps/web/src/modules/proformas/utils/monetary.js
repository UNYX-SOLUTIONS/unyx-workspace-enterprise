export const IVA_RATE_PERCENT = 15;

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function toCents(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100);
}

export function fromCents(cents) {
  return (cents || 0) / 100;
}

export function lineTotalCents(quantity, price) {
  return Math.round((toCents(quantity) * toCents(price)) / 100);
}

export function calculateTotals(items = []) {
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

export function formatCurrency(valueInCents) {
  return currencyFormatter.format(fromCents(valueInCents));
}

export function validateMonetary(value) {
  if (value === null || value === undefined || value === "") return false;
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(number) || number < 0) return false;
  return Math.abs(Math.round(number * 100) - number * 100) < 1e-6;
}
