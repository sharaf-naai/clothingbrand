// Shared by every src/lib/api/* file: mock switch and JSON helpers for /api.
import { ApiError, ApiRequestError } from "@/contracts/errors";

export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// The browser uses its own origin; server components need an absolute URL from NEXT_PUBLIC_SITE_URL.
const base = () => (typeof window === "undefined" ? process.env.NEXT_PUBLIC_SITE_URL : window.location.origin);

/** GET /api/<path>. Returns null on 404, throws on any other error. */
export async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(new URL(`/api${path}`, base()));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api${path} failed: ${res.status}`);
  return res.json();
}

/** POST JSON to /api/<path>. Throws ApiRequestError on any non-2xx, with the error code and fields when the body has them. */
export async function apiPost(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(new URL(`/api${path}`, base()), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ApiError.safeParse(data);
    throw new ApiRequestError(res.status, err.data?.error.code, err.data?.error.fields);
  }
  return data;
}
