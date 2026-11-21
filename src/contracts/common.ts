// Shapes shared by every resource (CLAUDE.md §5 conventions).
import { z } from "zod";

/** Money in integer minor units, never floats: { amount: 4900, currency: "EUR" } is €49.00. */
export const Money = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});
export type Money = z.infer<typeof Money>;

/** Paging query: page from 1, pageSize max 50. Coerced because it arrives as query-string text. */
export const PageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});

/** List response: { items, page, pageSize, total }. */
export const listOf = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1).max(50),
    total: z.number().int().nonnegative(),
  });
