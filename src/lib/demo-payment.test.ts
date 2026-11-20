import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDemoCard } from "./demo-payment.ts";

const now = new Date("2026-11-20T12:00:00Z");
const ok = { number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" };

test("a test card is approved and only the last 4 digits come back", () => {
  assert.deepEqual(checkDemoCard(ok, now), { ok: true, last4: "4242" });
});

test("the decline test card is declined", () => {
  assert.deepEqual(checkDemoCard({ ...ok, number: "4000-0000-0000-0002" }, now), { ok: false, declined: true });
});

test("any other number is refused, so nobody can pay with a real card", () => {
  const r = checkDemoCard({ ...ok, number: "4111 1111 1111 1111" }, now);
  assert.ok(!r.ok && !r.declined && r.errors.cardNumber);
});

test("expiry: valid through the end of its month, rejects bad formats", () => {
  assert.ok(checkDemoCard({ ...ok, expiry: "11/26" }, now).ok, "November 2026 is still valid on 20 Nov 2026");
  const past = checkDemoCard({ ...ok, expiry: "10/26" }, now);
  assert.ok(!past.ok && !past.declined && past.errors.cardExpiry === "This card has expired");
  const bad = checkDemoCard({ ...ok, expiry: "13/30", cvc: "1" }, now);
  assert.ok(!bad.ok && !bad.declined && bad.errors.cardExpiry && bad.errors.cardCvc);
});
