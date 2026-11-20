import type { Money } from "../contracts/common.ts";

/** { amount: 39000, currency: "EUR" } → "€390"; keeps decimals only when there are cents ("€45.50"). */
export function formatMoney({ amount, currency }: Money): string {
  const f = new Intl.NumberFormat("en", { style: "currency", currency, trailingZeroDisplay: "stripIfInteger" });
  // Minor units per currency come from Intl (EUR 2, JPY 0), never assume 100.
  return f.format(amount / 10 ** (f.resolvedOptions().maximumFractionDigits ?? 2));
}
