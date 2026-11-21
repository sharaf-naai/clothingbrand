import type { Metadata } from "next";
import { SiteHeader } from "@/components/shop/site-header";
import { WishlistGrid } from "@/components/shop/wishlist-grid";

export const metadata: Metadata = { title: "Wishlist · VEYL", robots: { index: false } };

export default function WishlistPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 pb-24 pt-10 sm:px-12 sm:pt-16">
        <h1 className="border-b border-stone pb-6 font-serif text-5xl leading-none tracking-[-0.02em] sm:text-7xl">Wishlist</h1>
        <WishlistGrid />
      </main>
    </>
  );
}
