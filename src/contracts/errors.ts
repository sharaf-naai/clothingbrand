// Error body for every non-2xx API response (CLAUDE.md §5). SHARED: add codes here, both approve.
import { z } from "zod";

export const ErrorCode = z.enum([
  "VALIDATION_ERROR", // 400: input failed its schema; `fields` says which
  "NOT_FOUND", // 404
  "DEMO_FORBIDDEN", // 403: the DEMO role can't do this (§7)
]);

export const ApiError = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    /** Field path → message, for VALIDATION_ERROR. */
    fields: z.record(z.string(), z.string()).optional(),
  }),
});

export type ErrorCode = z.infer<typeof ErrorCode>;
export type ApiError = z.infer<typeof ApiError>;
