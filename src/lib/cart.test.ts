import { test } from "node:test";
import assert from "node:assert/strict";
import { addLine, applyValidation, cartTotals, MAX_QTY, setLineQty } from "./cart.ts";

const coat = {
  variantId: "coat-m-ivory",
  slug: "wool-coat",
  name: "Oversized Wool Coat",
  color: "Ivory",
  size: "M",
  price: { amount: 39000, currency: "EUR" },
  maxQty: 2,
};
const tote = { ...coat, variantId: "tote-one-ivory", slug: "canvas-tote", name: "Canvas Tote", size: "ONE", price: { amount: 6000, currency: "EUR" }, maxQty: 50 };

test("adding the same variant increases qty, capped at stock", () => {
  let lines = addLine([], coat);
  lines = addLine(lines, coat);
  lines = addLine(lines, coat);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].qty, 2);
});

test("stock above MAX_QTY is capped", () => {
  assert.equal(addLine([], tote, 99)[0].qty, MAX_QTY);
});

test("setLineQty clamps and removes at 0", () => {
  const lines = addLine(addLine([], coat), tote);
  assert.equal(setLineQty(lines, coat.variantId, 5)[0].qty, 2);
  assert.deepEqual(setLineQty(lines, coat.variantId, 0).map((l) => l.variantId), [tote.variantId]);
});

test("totals count items and sum minor units", () => {
  const lines = addLine(addLine(addLine([], coat), coat), tote);
  assert.deepEqual(cartTotals(lines), { count: 3, subtotal: { amount: 84000, currency: "EUR" } });
  assert.deepEqual(cartTotals([]), { count: 0, subtotal: { amount: 0, currency: "EUR" } });
});

test("applyValidation updates, lowers and removes lines with a notice each", () => {
  const lines = addLine(addLine(addLine([], { ...coat, maxQty: 6 }, 3), tote), { ...tote, variantId: "gone", name: "Old Cap" });
  const line = (variantId: string, status: "OK" | "QTY_REDUCED" | "OUT_OF_STOCK" | "UNAVAILABLE", qty: number, amount: number | null) => ({
    variantId,
    status,
    requestedQty: 1,
    qty,
    unitPrice: amount === null ? null : { amount, currency: "EUR" },
    lineTotal: { amount: (amount ?? 0) * qty, currency: "EUR" },
    product: amount === null ? null : { slug: "x", name: variantId === tote.variantId ? "Canvas Tote" : "Oversized Wool Coat", color: "Ivory", size: "M" as const, image: null },
  });
  const { lines: next, notices } = applyValidation(lines, {
    items: [line(coat.variantId, "QTY_REDUCED", 2, 39000), line(tote.variantId, "OK", 1, 5500), line("gone", "UNAVAILABLE", 0, null)],
    subtotal: { amount: 0, currency: "EUR" },
    valid: false,
  });
  assert.deepEqual(next.map((l) => [l.variantId, l.qty, l.price.amount]), [
    [coat.variantId, 2, 39000],
    [tote.variantId, 1, 5500],
  ]);
  assert.equal(next[0].maxQty, 2);
  assert.deepEqual(notices, [
    "Only 2 left of Oversized Wool Coat (Ivory, M), so your quantity changed.",
    "Canvas Tote (Ivory) is now €55.",
    "Old Cap (Ivory) is no longer available and was removed.",
  ]);
});

test("applyValidation keeps lines added while the check was running", () => {
  const lines = addLine([], coat);
  assert.deepEqual(applyValidation(lines, { items: [], subtotal: { amount: 0, currency: "EUR" }, valid: true }).lines, lines);
});
