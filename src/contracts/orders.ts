// Contract for GET /api/orders/:number?token=… (CLAUDE.md §5, §6). SHARED: changing this file needs both approvals.
// The guest confirmation page. Unknown number OR wrong token → 404 (never reveal that an order exists).
import { z } from "zod";
import { Address, OrderNumber } from "./checkout.ts";
import { Money } from "./common.ts";
import { Size } from "./products.ts";

export const OrderStatus = z.enum(["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]);
export const PaymentStatus = z.enum(["PENDING", "PAID", "REFUNDED"]);

/** Snapshot taken when the order was placed (later product edits don't change it). */
export const OrderItem = z.object({
  variantId: z.string(),
  slug: z.string(),
  name: z.string(),
  color: z.string(),
  size: Size,
  image: z.string().nullable(),
  unitPrice: Money,
  qty: z.number().int().min(1),
  lineTotal: Money,
});

export const Order = z.object({
  number: OrderNumber,
  status: OrderStatus,
  paymentMethod: z.enum(["COD", "CARD"]),
  paymentStatus: PaymentStatus,
  createdAt: z.iso.datetime(),
  customer: z.object({ name: z.string(), email: z.email() }),
  address: Address,
  items: z.array(OrderItem).min(1),
  subtotal: Money,
  shipping: Money,
  total: Money,
});

export type OrderStatus = z.infer<typeof OrderStatus>;
export type OrderItem = z.infer<typeof OrderItem>;
export type Order = z.infer<typeof Order>;
