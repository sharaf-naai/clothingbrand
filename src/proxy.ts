// Next 16 renamed middleware.ts to proxy.ts. Frontend: locale routing. Backend: add the /admin auth guard here (edit together, see CLAUDE.md §4).
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip /api, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
