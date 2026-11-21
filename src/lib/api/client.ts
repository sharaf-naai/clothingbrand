// Shared by every src/lib/api/* file: mock switch and a JSON GET against /api.
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

/** GET /api/<path>. Returns null on 404, throws on any other error. */
export async function apiGet(path: string): Promise<unknown> {
  // Server components need an absolute URL, so the base comes from NEXT_PUBLIC_SITE_URL.
  const res = await fetch(new URL(`/api${path}`, process.env.NEXT_PUBLIC_SITE_URL));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /api${path} failed: ${res.status}`);
  return res.json();
}
