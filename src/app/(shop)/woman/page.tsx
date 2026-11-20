import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductListing } from "@/components/shop/product-listing";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Woman · VEYL" };

export default function WomanPage({ searchParams }: PageProps<"/woman">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: reading searchParams makes the listing dynamic (cacheComponents) */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <ProductListing title="Woman" section="WOMAN" basePath="/woman" searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
