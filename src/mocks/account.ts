// Mock account data. Pure functions: src/lib/api/account.ts keeps the mock session and addresses in cookies.
import { MAX_ADDRESSES, type AccountOrders, type AddressInput, type Customer, type SavedAddress } from "../contracts/account.ts";
import type { Order } from "../contracts/orders.ts";
import { getMockProduct } from "./products.ts";
import { encodeMockOrderToken } from "./orders.ts";

export const mockCustomer = (email: string): Customer => ({ email, name: null, phone: null });

/** Two past orders, so the account page has something to show. */
export function mockAccountOrders(email: string): AccountOrders {
  const coat = getMockProduct("wool-coat")!.variants.find((v) => v.size === "M" && v.color.name === "Stone")!;
  const tote = getMockProduct("canvas-tote")!.variants.find((v) => v.color.name === "Ivory")!;
  const address = { line1: "1 Rue Exemple", city: "Paris", postalCode: "75001", country: "FR" as const };
  const make = (number: string, createdAt: string, status: Order["status"], item: typeof coat, slug: string, name: string, qty: number): Order => {
    const subtotal = item.price.amount * qty;
    const shipping = subtotal >= 20000 ? 0 : 800;
    return {
      number,
      status,
      paymentMethod: "CARD",
      cardLast4: "4242",
      paymentStatus: "PAID",
      createdAt,
      customer: { name: "Demo Customer", email },
      address,
      items: [
        { variantId: item.id, slug, name, color: item.color.name, size: item.size, image: getMockProduct(slug)!.images[0] ?? null, unitPrice: item.price, qty, lineTotal: { ...item.price, amount: subtotal } },
      ],
      subtotal: { amount: subtotal, currency: "EUR" },
      shipping: { amount: shipping, currency: "EUR" },
      total: { amount: subtotal + shipping, currency: "EUR" },
    };
  };
  const orders = [
    make("VY-000117", "2026-11-12T10:20:00Z", "SHIPPED", tote, "canvas-tote", "Canvas Tote", 2),
    make("VY-000101", "2026-10-03T16:05:00Z", "DELIVERED", coat, "wool-coat", "Oversized Wool Coat", 1),
  ];
  return {
    items: orders.map((o) => ({
      number: o.number,
      token: encodeMockOrderToken(o),
      createdAt: o.createdAt,
      status: o.status,
      total: o.total,
      itemCount: o.items.reduce((n, i) => n + i.qty, 0),
    })),
    page: 1,
    pageSize: 24,
    total: orders.length,
  };
}

/** Returns the new list, or null when the address book is full. */
export function addMockAddress(list: SavedAddress[], input: AddressInput, id: string): SavedAddress[] | null {
  return list.length >= MAX_ADDRESSES ? null : [...list, { ...input, id }];
}

export const removeMockAddress = (list: SavedAddress[], id: string) => list.filter((a) => a.id !== id);
