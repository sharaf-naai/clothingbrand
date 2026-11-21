import type { Metadata } from "next";
import { Suspense } from "react";
import { DropsPage } from "@/components/shop/drops-page";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Drops · VEYL" };

export default function Drops() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: once the real API is on, the drop data is fetched per request (cacheComponents) */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <DropsPage />
        </Suspense>
      </main>
    </>
  );
}
