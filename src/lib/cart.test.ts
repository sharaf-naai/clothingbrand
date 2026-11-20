import { test } from "node:test";
import assert from "node:assert/strict";
import { addLine, cartTotals, MAX_QTY, setLineQty } from "./cart.ts";

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
