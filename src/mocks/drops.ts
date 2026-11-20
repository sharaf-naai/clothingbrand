// Mock drops, matching the drop on the mock products ("01", "Autumn").
import type { CurrentDrops, Drop } from "../contracts/drops.ts";

export const mockDrops: Drop[] = [
  { number: "01", name: "Autumn", releaseAt: "2026-11-01T09:00:00Z", status: "LIVE" },
  { number: "02", name: "Winter", releaseAt: "2027-01-15T09:00:00Z", status: "UPCOMING" },
];

/** Mimics GET /api/drops/current. */
export function currentMockDrops(): CurrentDrops {
  const live = mockDrops.filter((d) => d.status === "LIVE").sort((a, b) => b.releaseAt.localeCompare(a.releaseAt));
  const upcoming = mockDrops.filter((d) => d.status === "UPCOMING").sort((a, b) => a.releaseAt.localeCompare(b.releaseAt));
  return { current: live[0] ?? null, next: upcoming[0] ?? null };
}
