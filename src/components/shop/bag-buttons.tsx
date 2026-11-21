"use client";

import { cart, cartTotals, useCart, type CartLine } from "@/lib/cart";

function BagIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2.5 5.5h11l-1 9h-9z" />
      <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
    </svg>
  );
}

/** Header bag: icon + (count), opens the drawer. */
export function BagButton({ className }: { className: string }) {
  const { count } = cartTotals(useCart().lines);
  return (
    <button type="button" aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`} onClick={cart.open} className={`${className} gap-1.5`}>
      <BagIcon />
      <span aria-hidden="true">({count})</span>
    </button>
  );
}

/** Product page CTA. `line` is undefined until a buyable variant is chosen. */
export function AddToBagButton({ line, label }: { line?: Omit<CartLine, "qty">; label: string }) {
  return (
    <button
      type="button"
      disabled={!line}
      onClick={() => line && cart.add(line)}
      className="mt-8 flex min-h-12 w-full items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory disabled:bg-stone disabled:text-grey"
    >
      {label}
    </button>
  );
}
