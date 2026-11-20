import type { Money } from "../contracts/common.ts";

/** { amount: 39000, currency: "EUR" } → "€390"; keeps decimals only when there are cents ("€45.50"). */
export function formatMoney({ amount, currency }: Money): string {
  const f = new Intl.NumberFormat("en", { style: "currency", currency, trailingZeroDisplay: "stripIfInteger" });
  // Minor units per currency come from Intl (EUR 2, JPY 0), never assume 100.
  return f.format(amount / 10 ** (f.resolvedOptions().maximumFractionDigits ?? 2));
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "2027-01-15T09:00:00Z" → "15 January 2027". UTC, so server and browser always agree. */
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
