import { test } from "node:test";
import assert from "node:assert/strict";
import { getMockProduct } from "../mocks/products.ts";
import { selectVariant } from "./variants.ts";

const coat = getMockProduct("wool-coat")!; // Ivory + Stone, XS–L, S/Ivory sold out
const tote = getMockProduct("canvas-tote")!; // ONE size
const hoodie = getMockProduct("heavyweight-hoodie")!; // all sold out

test("defaults to the first colour and no size", () => {
  const s = selectVariant(coat);
  assert.equal(s.color.name, "Ivory");
  assert.equal(s.size, undefined);
  assert.equal(s.variant, undefined);
  assert.deepEqual(s.sizes.map((x) => x.size), ["XS", "S", "M", "L"]);
});

test("reads colour and size from the URL, case-insensitively", () => {
  const s = selectVariant(coat, "stone", "m");
  assert.equal(s.color.name, "Stone");
  assert.equal(s.variant?.size, "M");
});

test("ignores unknown colour and size", () => {
  const s = selectVariant(coat, "purple", "XXXL");
  assert.equal(s.color.name, "Ivory");
  assert.equal(s.variant, undefined);
});

test("a sold-out size can be selected but shows 0 stock", () => {
  assert.equal(selectVariant(coat, "Ivory", "S").variant?.stock, 0);
});

test("one-size products are preselected", () => {
  assert.equal(selectVariant(tote).variant?.size, "ONE");
});

test("fully sold-out product still resolves a colour", () => {
  const s = selectVariant(hoodie);
  assert.equal(s.color.name, "Taupe");
  assert.ok(s.sizes.every((x) => x.stock === 0));
});
