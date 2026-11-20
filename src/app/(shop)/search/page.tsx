import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/shop/search-results";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Search · VEYL", robots: { index: false } };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: reading searchParams makes the results dynamic (cacheComponents) */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
