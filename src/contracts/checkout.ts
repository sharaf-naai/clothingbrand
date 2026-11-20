// Contract for POST /api/checkout (CLAUDE.md §5). SHARED: changing this file needs both approvals.
// Guest checkout: creates the order. COD orders are placed straight away; CARD returns a Stripe Checkout URL
// (test mode) and the order is confirmed by the Stripe webhook.
import { z } from "zod";
import { CartValidateRequest } from "./cart.ts";
import { Money } from "./common.ts";

// PLACEHOLDER business rules, to confirm (CLAUDE.md §12): flat €8 shipping, free from €200, EU-only delivery.
export const SHIPPING = { flat: 800, freeFrom: 20000, currency: "EUR" } as const;
export const SHIP_TO = { FR: "France", BE: "Belgium", LU: "Luxembourg", NL: "Netherlands", DE: "Germany", ES: "Spain", IT: "Italy", PT: "Portugal" } as const;

/** Shipping for a subtotal in minor units. The server must use the same rule. */
export const shippingFor = (subtotal: number): Money => ({
  amount: subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flat,
  currency: SHIPPING.currency,
});

const required = (what: string) => z.string().trim().min(1, `Enter ${what}`);

export const CheckoutRequest = z.object({
  items: CartValidateRequest.shape.items,
  customer: z.object({
    email: z.email("Enter a valid email"),
    /** For delivery and order updates (WhatsApp / SMS). International format preferred. */
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
    name: required("your full name").max(100),
  }),
  address: z.object({
    line1: required("your address").max(120),
    line2: z.string().trim().max(120).optional(),
    city: required("your city").max(60),
    postalCode: required("your postal code").max(12),
    country: z.enum(Object.keys(SHIP_TO) as [keyof typeof SHIP_TO, ...(keyof typeof SHIP_TO)[]], "Choose a country"),
  }),
  paymentMethod: z.enum(["COD", "CARD"]),
});

const Totals = z.object({ subtotal: Money, shipping: Money, total: Money });

/**
 * 201. COD: the order exists, show the confirmation. CARD: send the browser to `checkoutUrl` (Stripe);
 * Stripe returns to /checkout?order=<orderNumber> after payment.
 * Errors: 400 VALIDATION_ERROR (`fields` keyed like "address.city"), 409 CART_CHANGED (prices or stock
 * changed since the bag was checked: call /api/cart/validate again and show the changes).
 */
export const CheckoutResponse = z.discriminatedUnion("paymentMethod", [
  Totals.extend({ paymentMethod: z.literal("COD"), orderNumber: z.string().regex(/^VY-\d{6}$/) }),
  Totals.extend({ paymentMethod: z.literal("CARD"), orderNumber: z.string().regex(/^VY-\d{6}$/), checkoutUrl: z.string() }),
]);

export type CheckoutRequest = z.infer<typeof CheckoutRequest>;
export type CheckoutResponse = z.infer<typeof CheckoutResponse>;
