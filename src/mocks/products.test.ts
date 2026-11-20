import { test } from "node:test";
import assert from "node:assert/strict";
import { Product, ProductList, ProductListQuery } from "../contracts/products.ts";
import { listMockProducts, mockProducts } from "./products.ts";

const list = (q: object = {}) => listMockProducts(ProductListQuery.parse(q));

test("every mock product matches the contract", () => {
  for (const p of mockProducts) Product.parse(p);
  ProductList.parse(list());
});

test("filters by section and search text", () => {
  const man = list({ section: "MAN" }).items;
  assert.ok(man.every((p) => p.section === "MAN" || p.section === "UNISEX"));
  assert.ok(man.some((p) => p.slug === "canvas-tote"), "unisex shows in MAN");
  assert.ok(list({ section: "UNISEX" }).items.every((p) => p.section === "UNISEX"));
  assert.deepEqual(list({ q: "TRENCH" }).items.map((p) => p.slug), ["trench"]);
});

test("sorts by price and defaults to newest", () => {
  const prices = list({ sort: "price-asc" }).items.map((p) => p.price.amount);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  assert.equal(list().items[0].slug, "heavyweight-hoodie");
});

test("pages with the total of all matches", () => {
  const page2 = list({ page: "2", pageSize: "4" });
  assert.equal(page2.items.length, mockProducts.length - 4);
  assert.equal(page2.total, mockProducts.length);
});

test("summary shows out of stock when every variant is at 0", () => {
  assert.equal(list({ q: "hoodie" }).items[0].inStock, false);
});

test("pageSize over 50 is rejected", () => {
  assert.throws(() => ProductListQuery.parse({ pageSize: 51 }));
});
