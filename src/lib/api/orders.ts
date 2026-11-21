// Orders API for components (CLAUDE.md §4).
import { Order } from "@/contracts/orders";
import { getMockOrder } from "@/mocks/orders";
import { apiGet, useMocks } from "./client";

/** Guest order confirmation (GET /api/orders/:number?token=…). null when the number or token is wrong. */
export async function getOrder(number: string, token: string): Promise<Order | null> {
  const data = useMocks
    ? getMockOrder(number, token)
    : await apiGet(`/orders/${encodeURIComponent(number)}?token=${encodeURIComponent(token)}`);
  return data === null ? null : Order.parse(data);
}
