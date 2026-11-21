// Mimics POST /api/checkout against the mock catalogue. No order is stored and no payment is taken.
import { shippingFor, type CheckoutRequest, type CheckoutResponse } from "../contracts/checkout.ts";
import { ApiRequestError } from "../contracts/errors.ts";
import type { Order } from "../contracts/orders.ts";
import { validateMockCart } from "./cart.ts";
import { encodeMockOrderToken } from "./orders.ts";

let next = 123;

export function checkoutMock(req: CheckoutRequest): CheckoutResponse {
  const cart = validateMockCart({ items: req.items });
  if (!cart.valid) throw new ApiRequestError(409, "CART_CHANGED");
  const shipping = shippingFor(cart.subtotal.amount);
  const totals = {
    subtotal: cart.subtotal,
    shipping,
    total: { amount: cart.subtotal.amount + shipping.amount, currency: cart.subtotal.currency },
  };
  const orderNumber = `VY-${String(next++).padStart(6, "0")}`;
  const order: Order = {
    number: orderNumber,
    status: req.paymentMethod === "COD" ? "NEW" : "CONFIRMED",
    paymentMethod: req.paymentMethod,
    cardLast4: req.card?.last4 ?? null,
    paymentStatus: req.paymentMethod === "COD" ? "PENDING" : "PAID",
    createdAt: new Date().toISOString(),
    customer: { name: req.customer.name, email: req.customer.email },
    address: req.address,
    items: cart.items.map((l) => ({
      variantId: l.variantId,
      slug: l.product!.slug,
      name: l.product!.name,
      color: l.product!.color,
      size: l.product!.size,
      image: l.product!.image,
      unitPrice: l.unitPrice!,
      qty: l.qty,
      lineTotal: l.lineTotal,
    })),
    ...totals,
  };
  const token = encodeMockOrderToken(order);
  return { paymentMethod: req.paymentMethod, orderNumber, token, ...totals };
}
