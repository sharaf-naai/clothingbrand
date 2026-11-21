// Drops API for components (CLAUDE.md §4).
import { CurrentDrops } from "@/contracts/drops";
import { currentMockDrops } from "@/mocks/drops";
import { apiGet, useMocks } from "./client";

/** The live drop and the next upcoming one (GET /api/drops/current). Either can be null. */
export async function getCurrentDrops(): Promise<CurrentDrops> {
  return CurrentDrops.parse(useMocks ? currentMockDrops() : await apiGet("/drops/current"));
}
