"use server";

// Account form handlers. Each one validates its input, then goes through src/lib/api (never the DB).
import { redirect } from "next/navigation";
import { AddressInput, LoginRequest } from "@/contracts/account";
import { ApiRequestError } from "@/contracts/errors";
import { addAddress, deleteAddress, logout, mockOpenLoginLink, requestLogin } from "@/lib/api/account";

export type LoginState = { sentTo?: string; error?: string };
export type AddressState = { errors?: Record<string, string>; ok?: boolean };

const text = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function loginAction(_: LoginState, f: FormData): Promise<LoginState> {
  const parsed = LoginRequest.safeParse({ email: text(f, "email").trim() });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    await requestLogin(parsed.data.email);
    return { sentTo: parsed.data.email };
  } catch {
    return { error: "We couldn't send the link just now. Please try again." };
  }
}

export async function mockOpenLinkAction(f: FormData) {
  await mockOpenLoginLink(text(f, "email"));
  redirect("/account");
}

export async function logoutAction() {
  await logout();
  redirect("/account");
}

export async function addAddressAction(_: AddressState, f: FormData): Promise<AddressState> {
  const parsed = AddressInput.safeParse({
    name: text(f, "name"),
    phone: text(f, "phone") || undefined,
    line1: text(f, "line1"),
    line2: text(f, "line2") || undefined,
    city: text(f, "city"),
    postalCode: text(f, "postalCode"),
    country: text(f, "country"),
  });
  if (!parsed.success) return { errors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])) };
  try {
    await addAddress(parsed.data);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiRequestError && e.fields) return { errors: e.fields };
    return { errors: { form: "Something went wrong. The address was not saved." } };
  }
}

export async function deleteAddressAction(f: FormData) {
  await deleteAddress(text(f, "id"));
}
