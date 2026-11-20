// Mimics POST /api/cart/validate against the mock catalogue.
import type { CartValidateRequest, CartValidateResponse, ValidatedCartLine } from "../contracts/cart.ts";
import { mockProducts } from "./products.ts";

export function validateMockCart({ items }: CartValidateRequest): CartValidateResponse {
  const lines: ValidatedCartLine[] = items.map(({ variantId, qty: requestedQty }) => {
    const product = mockProducts.find((p) => p.variants.some((v) => v.id === variantId));
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant) {
      return { variantId, status: "UNAVAILABLE", requestedQty, qty: 0, unitPrice: null, lineTotal: { amount: 0, currency: "EUR" }, product: null };
    }
    const qty = Math.min(requestedQty, variant.stock);
    return {
      variantId,
      status: variant.stock === 0 ? "OUT_OF_STOCK" : qty < requestedQty ? "QTY_REDUCED" : "OK",
      requestedQty,
      qty,
      unitPrice: variant.price,
      lineTotal: { ...variant.price, amount: variant.price.amount * qty },
      product: { slug: product.slug, name: product.name, color: variant.color.name, size: variant.size, image: product.images[0] ?? null },
    };
  });
  return {
    items: lines,
    subtotal: { amount: lines.reduce((n, l) => n + l.lineTotal.amount, 0), currency: "EUR" },
    valid: lines.every((l) => l.status === "OK"),
  };
}
