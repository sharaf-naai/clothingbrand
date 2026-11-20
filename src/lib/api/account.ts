// Account API (CLAUDE.md §4). Server-only: reads the request cookies, so call it from server components and actions.
import { cookies } from "next/headers";
import { z } from "zod";
import { AccountOrders, Addresses, AddressInput, Customer, LoginRequest, SavedAddress } from "@/contracts/account";
import { ApiError, ApiRequestError } from "@/contracts/errors";
import { addMockAddress, mockAccountOrders, mockCustomer, removeMockAddress } from "@/mocks/account";
import { useMocks } from "./client";

// Mock mode keeps the "session" (an email) and the address book in cookies. Real mode forwards the cookies to /api.
const MOCK_SESSION = "veyl_mock_session";
const MOCK_ADDRESSES = "veyl_mock_addresses";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };

async function call(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(new URL(`/api/account${path}`, process.env.NEXT_PUBLIC_SITE_URL), {
    method,
    headers: { cookie: (await cookies()).toString(), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiError.safeParse(data);
    throw new ApiRequestError(res.status, err.data?.error.code, err.data?.error.fields);
  }
  return data;
}

async function mockEmail() {
  return (await cookies()).get(MOCK_SESSION)?.value ?? null;
}

async function mockAddresses(): Promise<SavedAddress[]> {
  try {
    const parsed = z.array(SavedAddress).safeParse(JSON.parse((await cookies()).get(MOCK_ADDRESSES)?.value ?? "[]"));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** The signed-in customer, or null. */
export async function getMe(): Promise<Customer | null> {
  if (useMocks) {
    const email = await mockEmail();
    return email ? mockCustomer(email) : null;
  }
  try {
    return Customer.parse(await call("GET", "/me"));
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 401) return null;
    throw e;
  }
}

/** Sends the magic link. Mock: nothing is sent; the page offers a demo "open the link" button instead. */
export async function requestLogin(email: string): Promise<void> {
  const body = LoginRequest.parse({ email });
  if (!useMocks) await call("POST", "/login", body);
}

/** Mock only: what clicking the emailed link does (sets the session). */
export async function mockOpenLoginLink(email: string): Promise<void> {
  if (!useMocks) throw new Error("mockOpenLoginLink is for mock mode only");
  (await cookies()).set(MOCK_SESSION, LoginRequest.parse({ email }).email, cookieOpts);
}

export async function logout(): Promise<void> {
  if (useMocks) (await cookies()).delete(MOCK_SESSION);
  else await call("POST", "/logout");
}

export async function listMyOrders(): Promise<AccountOrders> {
  if (useMocks) return AccountOrders.parse(mockAccountOrders((await mockEmail()) ?? ""));
  return AccountOrders.parse(await call("GET", "/orders"));
}

export async function listAddresses(): Promise<SavedAddress[]> {
  if (useMocks) return mockAddresses();
  return Addresses.parse(await call("GET", "/addresses")).items;
}

/** Throws ApiRequestError VALIDATION_ERROR when the address book is full. */
export async function addAddress(input: AddressInput): Promise<void> {
  const body = AddressInput.parse(input);
  if (!useMocks) return void SavedAddress.parse(await call("POST", "/addresses", body));
  const next = addMockAddress(await mockAddresses(), body, crypto.randomUUID());
  if (!next) throw new ApiRequestError(400, "VALIDATION_ERROR", { form: "Your address book is full. Remove one first." });
  (await cookies()).set(MOCK_ADDRESSES, JSON.stringify(next), cookieOpts);
}

export async function deleteAddress(id: string): Promise<void> {
  if (!useMocks) return void (await call("DELETE", `/addresses/${encodeURIComponent(id)}`));
  (await cookies()).set(MOCK_ADDRESSES, JSON.stringify(removeMockAddress(await mockAddresses(), id)), cookieOpts);
}
