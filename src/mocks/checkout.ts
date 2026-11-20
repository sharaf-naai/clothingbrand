// Mimics POST /api/checkout against the mock catalogue. No order is stored and no payment is taken.
import { shippingFor, type CheckoutRequest, type CheckoutResponse } from "../contracts/checkout.ts";
import { ApiRequestError } from "../contracts/errors.ts";
import { validateMockCart } from "./cart.ts";

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
  // Real CARD orders go to Stripe; the mock skips straight to the return URL Stripe would use.
  return req.paymentMethod === "COD"
    ? { paymentMethod: "COD", orderNumber, ...totals }
    : { paymentMethod: "CARD", orderNumber, checkoutUrl: `/checkout?order=${orderNumber}`, ...totals };
}
