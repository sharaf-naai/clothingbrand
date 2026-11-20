// Cart API for components (CLAUDE.md §4).
import { z } from "zod";
import { CartValidateRequest, CartValidateResponse } from "@/contracts/cart";
import { cart } from "@/lib/cart";
import { validateMockCart } from "@/mocks/cart";
import { apiPost, useMocks } from "./client";

/** Re-price the bag and check stock (POST /api/cart/validate). Lines come back in the same order. */
export async function validateCart(items: z.input<typeof CartValidateRequest>["items"]): Promise<CartValidateResponse> {
  const req = CartValidateRequest.parse({ items });
  const data = useMocks ? validateMockCart(req) : await apiPost("/cart/validate", req);
  return CartValidateResponse.parse(data);
}

/** Re-checks the saved bag and applies the result (prices, stock, removals + notices). Used by the drawer and checkout. */
export async function recheckCart(isCurrent: () => boolean = () => true) {
  const items = cart.lines();
  if (items.length === 0) return;
  cart.startCheck();
  try {
    const res = await validateCart(items.map(({ variantId, qty }) => ({ variantId, qty })));
    if (isCurrent()) cart.applyValidation(res);
  } catch {
    if (isCurrent()) cart.checkFailed();
  }
}
