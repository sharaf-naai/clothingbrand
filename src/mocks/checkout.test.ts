import { test } from "node:test";
import assert from "node:assert/strict";
import { CheckoutRequest, CheckoutResponse, shippingFor } from "../contracts/checkout.ts";
import { ApiRequestError } from "../contracts/errors.ts";
import { checkoutMock } from "./checkout.ts";
import { getMockOrder } from "./orders.ts";

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

test("CARD order is paid and keeps only the last 4 digits; free shipping over €200", () => {
  const r = CheckoutResponse.parse(
    checkoutMock(CheckoutRequest.parse({ ...valid, paymentMethod: "CARD", card: { last4: "4242" }, items: [{ variantId: "vy-coat-m-ivory", qty: 1 }] })),
  );
  const order = getMockOrder(r.orderNumber, r.token)!;
  assert.deepEqual([order.paymentMethod, order.paymentStatus, order.cardLast4], ["CARD", "PAID", "4242"]);
  assert.equal(r.shipping.amount, 0);
});

test("PAYPAL is paid with no card; CARD needs last4 and nothing more", () => {
  const r = checkoutMock(CheckoutRequest.parse({ ...valid, paymentMethod: "PAYPAL" }));
  const order = getMockOrder(r.orderNumber, r.token)!;
  assert.deepEqual([order.paymentStatus, order.cardLast4], ["PAID", null]);
  assert.throws(() => CheckoutRequest.parse({ ...valid, paymentMethod: "CARD" }), /Card details missing/);
  assert.throws(() => CheckoutRequest.parse({ ...valid, paymentMethod: "CARD", card: { last4: "4242424242424242" } }));
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

test("the order behind a checkout can be read back with its token, and only with it", async () => {
  const { Order } = await import("../contracts/orders.ts");
  const r = checkoutMock(CheckoutRequest.parse({ ...valid, customer: { ...valid.customer, name: "Zoë Ångström" } }));
  const order = Order.parse(getMockOrder(r.orderNumber, r.token));
  assert.equal(order.customer.name, "Zoë Ångström");
  assert.deepEqual(order.items.map((i) => [i.name, i.qty]), [["Canvas Tote", 1]]);
  assert.equal(order.total.amount, r.total.amount);
  assert.equal(getMockOrder("VY-999999", r.token), null, "number must match");
  assert.equal(getMockOrder(r.orderNumber, "mock.garbage"), null);
  assert.equal(getMockOrder(r.orderNumber, "x".repeat(20)), null);
});
