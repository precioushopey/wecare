/** Locale-aware formatting helpers. `locale` is the i18n language ("de" | "en"). */

export function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatPriceEur(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === "de" ? "de-AT" : "en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
