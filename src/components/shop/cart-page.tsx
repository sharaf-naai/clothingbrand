"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { SHIPPING, shippingFor } from "@/contracts/checkout";
import { recheckCart } from "@/lib/api/cart";
import { cartTotals, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { BagLine } from "./cart-drawer";
import { fieldLabel as label } from "./form-field";

const textLink = "inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]";
const noop = () => () => {};

// /cart: the full bag. Same store and re-check as the drawer, plus shipping in the summary.
export function CartPage() {
  const mounted = useSyncExternalStore(noop, () => true, () => false); // the bag only exists in the browser
  const { lines, checking, notices } = useCart();
  const { count, subtotal } = cartTotals(lines);
  const shipping = shippingFor(subtotal.amount);
  const total = { ...subtotal, amount: subtotal.amount + shipping.amount };

  useEffect(() => {
    recheckCart();
  }, []);

  if (!mounted) return <div className="min-h-[50svh]" />;

  return (
    <div className="px-5 pb-24 pt-10 sm:px-12 sm:pt-16">
      <div className="flex items-end justify-between gap-6 border-b border-stone pb-6">
        <h1 className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-7xl">Bag</h1>
        <p className={label}>
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      {notices.length > 0 && (
        <ul aria-live="polite" className="mt-6 space-y-1 border-l border-burgundy pl-3 text-xs text-burgundy">
          {notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      {lines.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl italic">Your bag is empty.</p>
          <p className="mt-6 flex justify-center gap-8">
            <Link href="/woman" className={textLink}>
              Shop Woman
            </Link>
            <Link href="/man" className={textLink}>
              Shop Man
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20">
          <ul className="divide-y divide-stone">
            {lines.map((l) => (
              <BagLine key={l.variantId} line={l} large />
            ))}
          </ul>
          <aside aria-labelledby="bag-summary" className="lg:sticky lg:top-10 lg:self-start">
            <h2 id="bag-summary" className={label}>
              Summary
            </h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t border-stone pt-4 text-xs">
              <dt>Subtotal</dt>
              <dd className="text-right">{formatMoney(subtotal)}</dd>
              <dt>Shipping</dt>
              <dd className="text-right">{shipping.amount === 0 ? "Free" : formatMoney(shipping)}</dd>
              <dt className="pt-2 uppercase tracking-[.12em]">Total</dt>
              <dd className="pt-2 text-right uppercase tracking-[.12em]">{formatMoney(total)}</dd>
            </dl>
            {shipping.amount > 0 && (
              <p className="mt-3 text-xs text-grey">
                Free shipping from {formatMoney({ amount: SHIPPING.freeFrom, currency: SHIPPING.currency })}: add{" "}
                {formatMoney({ amount: SHIPPING.freeFrom - subtotal.amount, currency: SHIPPING.currency })} more.
              </p>
            )}
            {checking ? (
              <button type="button" disabled className="mt-6 flex min-h-12 w-full items-center justify-center bg-stone text-xs uppercase tracking-[.14em] text-grey">
                Checking stock…
              </button>
            ) : (
              <Link href="/checkout" className="mt-6 flex min-h-12 w-full items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory">
                Checkout
              </Link>
            )}
            <Link href="/woman" className={`${textLink} mt-2 w-full justify-center`}>
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
