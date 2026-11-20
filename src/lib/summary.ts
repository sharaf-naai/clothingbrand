import type { Product, ProductSummary } from "../contracts/products.ts";

/** Full product → the light summary used by grids (and saved in the wishlist). */
export function toSummary(p: Product): ProductSummary {
  const colors = [...new Map(p.variants.map((v) => [v.color.name, v.color])).values()];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    section: p.section,
    price: p.price,
    images: p.images,
    colors,
    inStock: p.variants.some((v) => v.stock > 0),
  };
}
