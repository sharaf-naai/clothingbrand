// Error body for every non-2xx API response (CLAUDE.md §5). SHARED: add codes here, both approve.
import { z } from "zod";

export const ErrorCode = z.enum([
  "VALIDATION_ERROR", // 400: input failed its schema; `fields` says which
  "NOT_FOUND", // 404
  "DEMO_FORBIDDEN", // 403: the DEMO role can't do this (§7)
  "CART_CHANGED", // 409: checkout found different prices or stock than the bag; re-validate the cart
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

/** Thrown by src/lib/api (and the mocks) for a non-2xx response, so callers can branch on `code`. */
export class ApiRequestError extends Error {
  status: number;
  code?: ErrorCode;
  fields?: Record<string, string>;
  constructor(status: number, code?: ErrorCode, fields?: Record<string, string>) {
    super(code ?? `HTTP ${status}`);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
export type ApiError = z.infer<typeof ApiError>;
