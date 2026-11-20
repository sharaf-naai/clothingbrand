import { test } from "node:test";
import assert from "node:assert/strict";
import { CartValidateRequest, CartValidateResponse } from "../contracts/cart.ts";
import { ApiError } from "../contracts/errors.ts";
import { validateMockCart } from "./cart.ts";

const validate = (items: object[]) => CartValidateResponse.parse(validateMockCart(CartValidateRequest.parse({ items })));

test("prices and totals a buyable bag", () => {
  const r = validate([
    { variantId: "vy-coat-m-ivory", qty: 1 },
    { variantId: "vy-tote-one-navy", qty: 2 },
  ]);
  assert.deepEqual(r.items.map((l) => l.status), ["OK", "OK"]);
  assert.equal(r.subtotal.amount, 39000 + 2 * 6000);
  assert.equal(r.valid, true);
  assert.equal(r.items[0].product?.name, "Oversized Wool Coat");
});

test("flags reduced, out-of-stock and unknown lines, in request order", () => {
  const r = validate([
    { variantId: "vy-coat-m-stone", qty: 9 }, // stock 6
    { variantId: "vy-coat-s-ivory", qty: 1 }, // sold out
    { variantId: "nope", qty: 1 },
  ]);
  assert.deepEqual(r.items.map((l) => [l.status, l.qty]), [["QTY_REDUCED", 6], ["OUT_OF_STOCK", 0], ["UNAVAILABLE", 0]]);
  assert.equal(r.subtotal.amount, 6 * 39000);
  assert.equal(r.valid, false);
  assert.equal(r.items[2].unitPrice, null);
});

test("request rules: qty 1–10, at least one item, no duplicate variants", () => {
  assert.throws(() => CartValidateRequest.parse({ items: [] }));
  assert.throws(() => CartValidateRequest.parse({ items: [{ variantId: "a", qty: 11 }] }));
  assert.throws(() => CartValidateRequest.parse({ items: [{ variantId: "a", qty: 0 }] }));
  assert.throws(() => CartValidateRequest.parse({ items: [{ variantId: "a", qty: 1 }, { variantId: "a", qty: 2 }] }));
});

test("error body shape", () => {
  ApiError.parse({ error: { code: "VALIDATION_ERROR", message: "Invalid cart", fields: { "items.0.qty": "Too big" } } });
  assert.throws(() => ApiError.parse({ error: { code: "TEAPOT", message: "" } }));
});
