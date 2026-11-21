// Checkout API for components (CLAUDE.md §4).
import { CheckoutRequest, CheckoutResponse } from "@/contracts/checkout";
import { checkoutMock } from "@/mocks/checkout";
import { apiPost, useMocks } from "./client";

/** POST /api/checkout. Throws ApiRequestError (VALIDATION_ERROR with `fields`, or CART_CHANGED). */
export async function placeOrder(req: CheckoutRequest): Promise<CheckoutResponse> {
  const body = CheckoutRequest.parse(req);
  const data = useMocks ? checkoutMock(body) : await apiPost("/checkout", body);
  return CheckoutResponse.parse(data);
}
