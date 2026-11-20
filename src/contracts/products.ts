// Contract for GET /api/products and GET /api/products/:slug (CLAUDE.md §5, §6).
// SHARED: changing this file needs both approvals.
// Relative imports keep the .ts extension so `node --test` can load contracts and mocks directly.
import { z } from "zod";
import { listOf, Money, PageQuery } from "./common.ts";

export const Section = z.enum(["WOMAN", "MAN", "UNISEX"]);
export const Size = z.enum(["XS", "S", "M", "L", "XL", "XXL", "ONE"]);

export const Color = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const Variant = z.object({
  id: z.string(),
  sku: z.string(),
  size: Size,
  color: Color,
  stock: z.number().int().nonnegative(),
  /** Final price for this variant: the API applies priceOverride, the frontend never does. */
  price: Money,
});

/** Full product, for the product page. Only PUBLISHED products are returned publicly. */
export const Product = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  section: Section,
  category: z.object({ slug: z.string(), name: z.string() }),
  drop: z.object({ number: z.string(), name: z.string() }).nullable(),
  /** Base price, shown as "from" when variants differ. */
  price: Money,
  /** Image URLs, first one is the main image. Can be empty while photos are missing. */
  images: z.array(z.string()),
  variants: z.array(Variant).min(1),
  createdAt: z.iso.datetime(),
});

/** Light product, for listing grids and search results. */
export const ProductSummary = Product.pick({
  id: true,
  slug: true,
  name: true,
  section: true,
  price: true,
  images: true,
}).extend({
  colors: z.array(Color),
  inStock: z.boolean(),
});

/** GET /api/products query string. */
export const ProductListQuery = PageQuery.extend({
  section: Section.optional(),
  category: z.string().optional(),
  drop: z.string().optional(),
  color: z.string().optional(),
  size: Size.optional(),
  sort: z.enum(["newest", "price-asc", "price-desc"]).default("newest"),
  q: z.string().trim().min(1).optional(),
});

export const ProductList = listOf(ProductSummary);

export type Section = z.infer<typeof Section>;
export type Size = z.infer<typeof Size>;
export type Color = z.infer<typeof Color>;
export type Variant = z.infer<typeof Variant>;
export type Product = z.infer<typeof Product>;
export type ProductSummary = z.infer<typeof ProductSummary>;
export type ProductListQuery = z.infer<typeof ProductListQuery>;
export type ProductList = z.infer<typeof ProductList>;
