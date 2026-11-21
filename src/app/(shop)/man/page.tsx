import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductListing } from "@/components/shop/product-listing";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Man · VEYL" };

export default function ManPage({ searchParams }: PageProps<"/man">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: reading searchParams makes the listing dynamic (cacheComponents) */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <ProductListing title="Man" section="MAN" basePath="/man" searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
