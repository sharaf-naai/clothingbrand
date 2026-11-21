// Products API for components. Pages call these, never fetch /api directly (CLAUDE.md §4).
import { z } from "zod";
import { Product, ProductList, ProductListQuery } from "@/contracts/products";
import { getMockProduct, listMockProducts } from "@/mocks/products";
import { apiGet, useMocks } from "./client";

/** List products (GET /api/products). Every field is optional; defaults: page 1, 24 per page, newest first. */
export async function listProducts(query: z.input<typeof ProductListQuery> = {}): Promise<ProductList> {
  const q = ProductListQuery.parse(query);
  const params = new URLSearchParams(
    Object.entries(q).flatMap(([k, v]) => (v === undefined ? [] : [[k, String(v)]])),
  );
  const data = useMocks ? listMockProducts(q) : await apiGet(`/products?${params}`);
  // Parse both paths, so a mock or an API response that drifts from the contract fails loudly.
  return ProductList.parse(data);
}

/** One product with variants and stock (GET /api/products/:slug). null if it doesn't exist. */
export async function getProduct(slug: string): Promise<Product | null> {
  const data = useMocks ? getMockProduct(slug) : await apiGet(`/products/${encodeURIComponent(slug)}`);
  return data === null ? null : Product.parse(data);
}
