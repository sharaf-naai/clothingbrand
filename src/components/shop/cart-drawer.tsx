"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { recheckCart } from "@/lib/api/cart";
import { cart, cartTotals, useCart, type CartLine } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

const label = "text-[11px] uppercase tracking-[.16em] text-grey";
const checkoutCls = "mt-5 flex min-h-12 w-full items-center justify-center text-xs uppercase tracking-[.14em]";
const qtyBtn = "flex size-11 items-center justify-center text-base disabled:text-stone";

function Line({ line: l }: { line: CartLine }) {
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/products/${l.slug}?color=${encodeURIComponent(l.color)}&size=${l.size}`} onClick={cart.close} className="relative aspect-[4/5] w-20 shrink-0 bg-stone">
        {l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />}
        <span className="sr-only">{l.name}</span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3 text-xs uppercase tracking-[.12em]">
          <p>{l.name}</p>
          <p className="shrink-0">{formatMoney({ ...l.price, amount: l.price.amount * l.qty })}</p>
        </div>
        <p className={`${label} mt-1`}>
          {l.color}
          {l.size !== "ONE" && ` · ${l.size}`}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="-ml-3 flex items-center" role="group" aria-label={`Quantity of ${l.name}`}>
            <button type="button" className={qtyBtn} aria-label="Decrease quantity" onClick={() => cart.setQty(l.variantId, l.qty - 1)}>
              −
            </button>
            <span className="min-w-4 text-center text-xs" aria-live="polite">
              {l.qty}
            </span>
            <button
              type="button"
              className={qtyBtn}
              aria-label="Increase quantity"
              disabled={l.qty >= l.maxQty}
              onClick={() => cart.setQty(l.variantId, l.qty + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-[11px] uppercase tracking-[.14em] text-grey underline decoration-1 underline-offset-4 hover:text-ink"
            onClick={() => cart.setQty(l.variantId, 0)}
          >
            Remove<span className="sr-only"> {l.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

// Slide-in bag. A native <dialog> gives focus trapping, Esc to close and an inert page behind it.
export function CartDrawer() {
  const { lines, open, checking, notices } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const { count, subtotal } = cartTotals(lines);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Re-price and re-check stock every time the drawer opens.
  useEffect(() => {
    if (!open) return;
    let current = true;
    recheckCart(() => current);
    return () => {
      current = false;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="bag-title"
      onClose={cart.close}
      // A click on the dialog itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && cart.close()}
      className="cart-drawer m-0 ml-auto h-dvh max-h-none w-full max-w-[420px] bg-ivory p-0 text-ink"
    >
      <div className="flex h-full flex-col px-5 sm:px-8">
        <div className="flex items-center justify-between border-b border-stone py-3">
          <h2 id="bag-title" className="text-xs uppercase tracking-[.12em]">
            Bag ({count})
          </h2>
          <button type="button" onClick={cart.close} className="inline-flex min-h-11 items-center text-xs uppercase tracking-[.12em]">
            Close
          </button>
        </div>

        {notices.length > 0 && (
          <ul aria-live="polite" className="mt-4 space-y-1 border-l border-burgundy pl-3 text-xs text-burgundy">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-serif text-3xl italic">Your bag is empty.</p>
            <Link
              href="/drops"
              onClick={cart.close}
              className="mt-4 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]"
            >
              Shop the drop <span aria-hidden="true">&nbsp;→</span>
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-stone overflow-y-auto">
              {lines.map((l) => (
                <Line key={l.variantId} line={l} />
              ))}
            </ul>
            <div className="border-t border-stone py-5">
              <div className="flex justify-between text-xs uppercase tracking-[.12em]">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <p className={`${label} mt-2 normal-case tracking-normal`}>Shipping and discount codes at checkout.</p>
              {checking ? (
                <button type="button" disabled className={`${checkoutCls} bg-stone text-grey`}>
                  Checking stock…
                </button>
              ) : (
                // shortcut: /checkout doesn't exist yet
                <Link href="/checkout" onClick={cart.close} className={`${checkoutCls} bg-ink text-ivory`}>
                  Checkout
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
