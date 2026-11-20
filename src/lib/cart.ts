// Client-side bag: a tiny store saved to localStorage, shared by the header count, Add to bag and the drawer.
// shortcut: prices are the snapshot from when the item was added; re-price with POST /api/cart/validate at checkout once that contract exists
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { Money } from "../contracts/common.ts";

export const MAX_QTY = 10;

const CartLine = z.object({
  variantId: z.string(),
  slug: z.string(),
  name: z.string(),
  color: z.string(),
  size: z.string(),
  price: Money,
  image: z.string().optional(),
  /** Stock when added, capped at MAX_QTY. */
  maxQty: z.number().int().min(1),
  qty: z.number().int().min(1),
});
export type CartLine = z.infer<typeof CartLine>;

// --- Pure helpers (tested in cart.test.ts) ---

export function addLine(lines: CartLine[], line: Omit<CartLine, "qty">, qty = 1): CartLine[] {
  const max = Math.min(line.maxQty, MAX_QTY);
  const existing = lines.find((l) => l.variantId === line.variantId);
  if (existing) return lines.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + qty, max) } : l));
  return [...lines, { ...line, maxQty: max, qty: Math.min(qty, max) }];
}

/** qty 0 or less removes the line. */
export function setLineQty(lines: CartLine[], variantId: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => l.variantId !== variantId);
  return lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(qty, l.maxQty) } : l));
}

export function cartTotals(lines: CartLine[]) {
  return {
    count: lines.reduce((n, l) => n + l.qty, 0),
    // One currency for the whole store (EUR), so the first line's currency is the bag's.
    subtotal: { amount: lines.reduce((n, l) => n + l.price.amount * l.qty, 0), currency: lines[0]?.price.currency ?? "EUR" },
  };
}

// --- Store ---

const KEY = "veyl.cart.v1";
type State = { lines: CartLine[]; open: boolean };
const EMPTY: State = { lines: [], open: false };
let state = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    // Saved data can be stale or edited by hand: keep it only if it still matches the shape.
    const parsed = z.array(CartLine).safeParse(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    if (parsed.success) state = { ...state, lines: parsed.data };
  } catch {
    // Private mode or blocked storage: start with an empty bag.
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state.lines));
  } catch {
    // Storage unavailable: the bag still works for this visit.
  }
  listeners.forEach((l) => l());
}

export const cart = {
  add: (line: Omit<CartLine, "qty">) => set({ lines: addLine(state.lines, line), open: true }),
  setQty: (variantId: string, qty: number) => set({ lines: setLineQty(state.lines, variantId, qty) }),
  open: () => set({ open: true }),
  close: () => set({ open: false }),
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Server render and first client render see an empty bag, then the saved one loads (no hydration mismatch). */
export function useCart(): State {
  return useSyncExternalStore(
    subscribe,
    () => (load(), state),
    () => EMPTY,
  );
}
