// Contract for customer accounts (CLAUDE.md §3: email magic link). SHARED: changing this file needs both approvals.
//
// POST   /api/account/login            LoginRequest → 202 { sent: true }. Always 202 (never reveal whether an
//                                      account exists). The emailed link signs in (session cookie) and lands on /account.
// POST   /api/account/logout           → 204
// GET    /api/account/me               → Customer, or 401 when signed out
// GET    /api/account/orders?page=     → AccountOrders, newest first
// GET    /api/account/addresses        → Addresses
// POST   /api/account/addresses        AddressInput → 201 SavedAddress (400 VALIDATION_ERROR when MAX_ADDRESSES reached)
// DELETE /api/account/addresses/:id    → 204
// Everything except login needs the session cookie: 401 without it.
import { z } from "zod";
import { Address, OrderNumber } from "./checkout.ts";
import { listOf, Money } from "./common.ts";
import { OrderStatus } from "./orders.ts";

export const MAX_ADDRESSES = 5;

export const LoginRequest = z.object({ email: z.email("Enter a valid email") });

export const Customer = z.object({
  email: z.email(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
});

export const OrderSummary = z.object({
  number: OrderNumber,
  /** Same token as the checkout one, so the account can link to /orders/<number>?token=… */
  token: z.string().min(16),
  createdAt: z.iso.datetime(),
  status: OrderStatus,
  total: Money,
  itemCount: z.number().int().min(1),
});
export const AccountOrders = listOf(OrderSummary);

export const AddressInput = Address.extend({
  name: z.string().trim().min(1, "Enter a name").max(100),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number").optional(),
});
export const SavedAddress = AddressInput.extend({ id: z.string() });
export const Addresses = z.object({ items: z.array(SavedAddress).max(MAX_ADDRESSES) });

export type Customer = z.infer<typeof Customer>;
export type OrderSummary = z.infer<typeof OrderSummary>;
export type AccountOrders = z.infer<typeof AccountOrders>;
export type AddressInput = z.infer<typeof AddressInput>;
export type SavedAddress = z.infer<typeof SavedAddress>;
