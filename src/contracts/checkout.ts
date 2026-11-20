// Contract for POST /api/checkout (CLAUDE.md §5). SHARED: changing this file needs both approvals.
// Guest checkout: creates the order.
// Payments are SIMULATED (concept store, CLAUDE.md §12): CARD and PAYPAL are approved by a demo step in the
// browser and arrive here already approved. No card number is ever sent: only `card.last4`, for display.
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

/** "VY-000123" */
export const OrderNumber = z.string().regex(/^VY-\d{6}$/);

export const Address = z.object({
  line1: required("your address").max(120),
  line2: z.string().trim().max(120).optional(),
  city: required("your city").max(60),
  postalCode: required("your postal code").max(12),
  country: z.enum(Object.keys(SHIP_TO) as [keyof typeof SHIP_TO, ...(keyof typeof SHIP_TO)[]], "Choose a country"),
});

/** COD: pay on delivery (payment PENDING). CARD / PAYPAL: simulated, recorded as PAID. */
export const PaymentMethod = z.enum(["COD", "CARD", "PAYPAL"]);

export const CheckoutRequest = z
  .object({
  items: CartValidateRequest.shape.items,
  customer: z.object({
    email: z.email("Enter a valid email"),
    /** For delivery and order updates (WhatsApp / SMS). International format preferred. */
    phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
    name: required("your full name").max(100),
  }),
  address: Address,
  paymentMethod: PaymentMethod,
  /** Required for CARD; display only ("card ending 4242"). */
  card: z.object({ last4: z.string().regex(/^\d{4}$/) }).optional(),
})
  .refine((r) => r.paymentMethod !== "CARD" || r.card, { message: "Card details missing", path: ["card"] });

const Created = z.object({
  orderNumber: OrderNumber,
  /** Secret for the guest confirmation page /orders/<orderNumber>?token=… (GET /api/orders/:number). Opaque. */
  token: z.string().min(16),
  subtotal: Money,
  shipping: Money,
  total: Money,
});

/**
 * 201: the order exists. The browser goes to /orders/<orderNumber>?token=<token>&placed=1.
 * Errors: 400 VALIDATION_ERROR (`fields` keyed like "address.city"), 409 CART_CHANGED (prices or stock
 * changed since the bag was checked: call /api/cart/validate again and show the changes).
 */
export const CheckoutResponse = Created.extend({ paymentMethod: PaymentMethod });

export type CheckoutRequest = z.infer<typeof CheckoutRequest>;
export type CheckoutResponse = z.infer<typeof CheckoutResponse>;
export type Address = z.infer<typeof Address>;
export type PaymentMethod = z.infer<typeof PaymentMethod>;
