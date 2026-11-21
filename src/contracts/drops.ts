// Contract for GET /api/drops/current (CLAUDE.md §5, §6). SHARED: changing this file needs both approvals.
// Drops are numbered limited releases. A drop's products are listed with GET /api/products?drop=<number>.
import { z } from "zod";

export const DropStatus = z.enum(["UPCOMING", "LIVE", "ENDED"]);

export const Drop = z.object({
  /** Two digits, "01". Also the `drop` filter value for /api/products and the `drop.number` on products. */
  number: z.string().regex(/^\d{2}$/),
  name: z.string(),
  releaseAt: z.iso.datetime(),
  status: DropStatus,
});

/** current: the most recent LIVE drop, or null. next: the soonest UPCOMING drop, or null. */
export const CurrentDrops = z.object({
  current: Drop.nullable(),
  next: Drop.nullable(),
});

export type DropStatus = z.infer<typeof DropStatus>;
export type Drop = z.infer<typeof Drop>;
export type CurrentDrops = z.infer<typeof CurrentDrops>;
