import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatMoney } from "./format.ts";

test("formatMoney uses minor units and drops .00", () => {
  assert.equal(formatMoney({ amount: 39000, currency: "EUR" }), "€390");
  assert.equal(formatMoney({ amount: 4550, currency: "EUR" }), "€45.50");
  assert.equal(formatMoney({ amount: 0, currency: "EUR" }), "€0");
  assert.equal(formatMoney({ amount: 5000, currency: "JPY" }), "¥5,000");
});

test("formatDate uses the UTC calendar day", () => {
  assert.equal(formatDate("2027-01-15T09:00:00Z"), "15 January 2027");
  assert.equal(formatDate("2026-11-01T23:30:00Z"), "1 November 2026");
});
