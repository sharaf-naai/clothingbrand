import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetail } from "@/components/shop/product-detail";
import { SiteHeader } from "@/components/shop/site-header";
import { getProduct } from "@/lib/api/products";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return { title: p ? `${p.name} · VEYL` : "VEYL" };
}

export default function ProductPage({ params, searchParams }: PageProps<"/products/[slug]">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: params and searchParams are request data (cacheComponents). An unknown slug shows the
            not-found page with status 200 + noindex, because streaming has already started. */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <ProductDetail params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
