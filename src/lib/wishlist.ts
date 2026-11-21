// Wishlist saved in the browser (works signed out), shared by the heart buttons, the header and /wishlist.
// shortcut: local only; sync to GET/POST/DELETE /api/wishlist for signed-in customers once that contract exists
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { ProductSummary } from "../contracts/products.ts";

export const MAX_WISHLIST = 50;

/** Pure: add if missing (newest first, capped), remove if present. */
export function toggleItem(items: ProductSummary[], item: ProductSummary): ProductSummary[] {
  return items.some((i) => i.slug === item.slug)
    ? items.filter((i) => i.slug !== item.slug)
    : [item, ...items].slice(0, MAX_WISHLIST);
}

const KEY = "veyl.wishlist.v1";
const EMPTY: ProductSummary[] = [];
let items = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed = z.array(ProductSummary).max(MAX_WISHLIST).safeParse(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    if (parsed.success) items = parsed.data;
  } catch {
    // Storage blocked or broken data: start empty.
  }
}

export const wishlist = {
  toggle(item: ProductSummary) {
    items = toggleItem(items, item);
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable: still works for this visit.
    }
    listeners.forEach((l) => l());
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Empty on the server and the first client render, then the saved list (no hydration mismatch). */
export function useWishlist(): ProductSummary[] {
  return useSyncExternalStore(
    subscribe,
    () => (load(), items),
    () => EMPTY,
  );
}
