import { test } from "node:test";
import assert from "node:assert/strict";
import { CurrentDrops } from "../contracts/drops.ts";
import { ProductListQuery } from "../contracts/products.ts";
import { currentMockDrops } from "./drops.ts";
import { listMockProducts } from "./products.ts";

test("current is the live drop, next is the upcoming one", () => {
  const { current, next } = CurrentDrops.parse(currentMockDrops());
  assert.equal(current?.number, "01");
  assert.equal(next?.number, "02");
});

test("the current drop's products come from the drop filter", () => {
  const { items } = listMockProducts(ProductListQuery.parse({ drop: currentMockDrops().current!.number }));
  assert.deepEqual(items.map((p) => p.slug).sort(), ["heavyweight-hoodie", "trench", "wool-coat"]);
});

test("drop numbers are two digits", () => {
  assert.throws(() => CurrentDrops.parse({ current: { number: "1", name: "x", releaseAt: "2026-01-01T00:00:00Z", status: "LIVE" }, next: null }));
});
