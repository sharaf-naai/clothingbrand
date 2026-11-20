// Contract for POST /api/cart/validate (CLAUDE.md §5). SHARED: changing this file needs both approvals.
// The bag lives in the browser with prices copied when items were added. This endpoint re-prices it and
// checks stock, so the drawer and checkout show what can actually be bought, at today's price.
import { z } from "zod";
import { Money } from "./common.ts";
import { Size } from "./products.ts";

/** Most of one variant per order. */
export const MAX_QTY = 10;

export const CartValidateRequest = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        qty: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1)
    .max(50)
    .refine((items) => new Set(items.map((i) => i.variantId)).size === items.length, "Each variant can appear only once"),
});

/**
 * OK: buyable as asked. QTY_REDUCED: less stock than asked, `qty` is what's left.
 * OUT_OF_STOCK: stock is 0. UNAVAILABLE: unknown variant, or the product isn't published any more.
 */
export const CartLineStatus = z.enum(["OK", "QTY_REDUCED", "OUT_OF_STOCK", "UNAVAILABLE"]);

export const ValidatedCartLine = z.object({
  variantId: z.string(),
  status: CartLineStatus,
  requestedQty: z.number().int().min(1),
  /** What can be bought now: requestedQty, the stock left, or 0. */
  qty: z.number().int().min(0),
  /** Current price (priceOverride applied). null when UNAVAILABLE. */
  unitPrice: Money.nullable(),
  /** unitPrice × qty (0 when qty is 0). */
  lineTotal: Money,
  /** Current details, so the bag can refresh names and images. null when UNAVAILABLE. */
  product: z
    .object({
      slug: z.string(),
      name: z.string(),
      color: z.string(),
      size: Size,
      image: z.string().nullable(),
    })
    .nullable(),
});

export const CartValidateResponse = z.object({
  /** Same order as the request. */
  items: z.array(ValidatedCartLine),
  /** Sum of lineTotal. Shipping and discounts are added at checkout. */
  subtotal: Money,
  /** true when every line is OK, so checkout can go ahead without changes. */
  valid: z.boolean(),
});

export type CartValidateRequest = z.infer<typeof CartValidateRequest>;
export type CartLineStatus = z.infer<typeof CartLineStatus>;
export type ValidatedCartLine = z.infer<typeof ValidatedCartLine>;
export type CartValidateResponse = z.infer<typeof CartValidateResponse>;
