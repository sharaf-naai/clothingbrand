import { test } from "node:test";
import assert from "node:assert/strict";
import { CheckoutRequest, CheckoutResponse, shippingFor } from "../contracts/checkout.ts";
import { ApiRequestError } from "../contracts/errors.ts";
import { checkoutMock } from "./checkout.ts";

const valid = {
  items: [{ variantId: "vy-tote-one-navy", qty: 1 }],
  customer: { email: "test@example.com", phone: "+33 6 12 34 56 78", name: "Test Customer" },
  address: { line1: "1 Rue Exemple", city: "Paris", postalCode: "75001", country: "FR" },
  paymentMethod: "COD",
};

test("shipping is flat until the free threshold", () => {
  assert.equal(shippingFor(6000).amount, 800);
  assert.equal(shippingFor(19999).amount, 800);
  assert.equal(shippingFor(20000).amount, 0);
});

test("COD order: totals include shipping", () => {
  const r = CheckoutResponse.parse(checkoutMock(CheckoutRequest.parse(valid)));
  assert.equal(r.paymentMethod, "COD");
  assert.match(r.orderNumber, /^VY-\d{6}$/);
  assert.deepEqual([r.subtotal.amount, r.shipping.amount, r.total.amount], [6000, 800, 6800]);
});

test("CARD order returns a checkout URL; free shipping over €200", () => {
  const r = CheckoutResponse.parse(
    checkoutMock(CheckoutRequest.parse({ ...valid, paymentMethod: "CARD", items: [{ variantId: "vy-coat-m-ivory", qty: 1 }] })),
  );
  assert.ok(r.paymentMethod === "CARD" && r.checkoutUrl.includes(r.orderNumber));
  assert.equal(r.shipping.amount, 0);
});

test("a changed cart is a 409 CART_CHANGED", () => {
  assert.throws(
    () => checkoutMock(CheckoutRequest.parse({ ...valid, items: [{ variantId: "vy-coat-s-ivory", qty: 1 }] })),
    (e: unknown) => e instanceof ApiRequestError && e.status === 409 && e.code === "CART_CHANGED",
  );
});

test("form errors point at the field", () => {
  const r = CheckoutRequest.safeParse({ ...valid, customer: { ...valid.customer, email: "nope" }, address: { ...valid.address, country: "US", city: " " } });
  assert.ok(!r.success);
  const paths = r.error.issues.map((i) => i.path.join("."));
  assert.deepEqual(paths.sort(), ["address.city", "address.country", "customer.email"]);
});
