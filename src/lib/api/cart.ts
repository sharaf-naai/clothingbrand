// Cart API for components (CLAUDE.md §4).
import { z } from "zod";
import { CartValidateRequest, CartValidateResponse } from "@/contracts/cart";
import { validateMockCart } from "@/mocks/cart";
import { apiPost, useMocks } from "./client";

/** Re-price the bag and check stock (POST /api/cart/validate). Lines come back in the same order. */
export async function validateCart(items: z.input<typeof CartValidateRequest>["items"]): Promise<CartValidateResponse> {
  const req = CartValidateRequest.parse({ items });
  const data = useMocks ? validateMockCart(req) : await apiPost("/cart/validate", req);
  return CartValidateResponse.parse(data);
}
