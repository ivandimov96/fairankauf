const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** 950000 → "9.500 €" (whole euros; cents are dropped). */
export function formatEuro(cents: number): string {
  return euro.format(Math.round(cents / 100));
}

const number = new Intl.NumberFormat("de-DE");

/** 123000 → "123.000" */
export function formatNumber(n: number): string {
  return number.format(n);
}
