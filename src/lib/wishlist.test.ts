import { test } from "node:test";
import assert from "node:assert/strict";
import { getMockProduct } from "../mocks/products.ts";
import { toSummary } from "./summary.ts";
import { MAX_WISHLIST, toggleItem } from "./wishlist.ts";

const coat = toSummary(getMockProduct("wool-coat")!);
const tote = toSummary(getMockProduct("canvas-tote")!);

test("toggle adds newest first, and removes when already saved", () => {
  let items = toggleItem([], coat);
  items = toggleItem(items, tote);
  assert.deepEqual(items.map((i) => i.slug), ["canvas-tote", "wool-coat"]);
  assert.deepEqual(toggleItem(items, coat).map((i) => i.slug), ["canvas-tote"]);
});

test("the list is capped", () => {
  const many = Array.from({ length: MAX_WISHLIST }, (_, i) => ({ ...coat, slug: `p${i}` }));
  const next = toggleItem(many, tote);
  assert.equal(next.length, MAX_WISHLIST);
  assert.equal(next[0].slug, "canvas-tote");
});

test("summary keeps unique colours and stock", () => {
  assert.deepEqual(coat.colors.map((c) => c.name), ["Ivory", "Stone"]);
  assert.equal(toSummary(getMockProduct("heavyweight-hoodie")!).inStock, false);
});
