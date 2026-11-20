// Mock orders. Checkout runs in the browser and the order page on the server, so they can't share memory:
// the mock checkout packs the order into its token, and the mock order lookup unpacks it.
// Real tokens are opaque random secrets; never put order data in them.
import type { Order } from "../contracts/orders.ts";

const PREFIX = "mock.";

function toBase64Url(text: string) {
  const bin = Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join("");
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string) {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export const encodeMockOrderToken = (order: Order) => PREFIX + toBase64Url(JSON.stringify(order));

/** Mimics GET /api/orders/:number?token=…; null (404) for a bad token or a number that doesn't match. */
export function getMockOrder(number: string, token: string): Order | null {
  if (!token.startsWith(PREFIX)) return null;
  try {
    const order = JSON.parse(fromBase64Url(token.slice(PREFIX.length))) as Order;
    return order.number === number ? order : null;
  } catch {
    return null;
  }
}
