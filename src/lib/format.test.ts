import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney } from "./format.ts";

test("formatMoney uses minor units and drops .00", () => {
  assert.equal(formatMoney({ amount: 39000, currency: "EUR" }), "€390");
  assert.equal(formatMoney({ amount: 4550, currency: "EUR" }), "€45.50");
  assert.equal(formatMoney({ amount: 0, currency: "EUR" }), "€0");
  assert.equal(formatMoney({ amount: 5000, currency: "JPY" }), "¥5,000");
});
