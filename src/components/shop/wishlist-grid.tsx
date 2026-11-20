"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "./product-card";

const noop = () => () => {};

/** /wishlist content: the saved products in the usual grid. */
export function WishlistGrid() {
  const mounted = useSyncExternalStore(noop, () => true, () => false); // the list only exists in the browser
  const items = useWishlist();
  if (!mounted) return <div className="min-h-[50svh]" />;
  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-3xl italic">Nothing saved yet.</p>
        <p className="mt-3 text-sm text-grey">Tap the heart on any piece to keep it here.</p>
        <Link href="/drops" className="mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
          See the current drop <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </div>
    );
  }
  return (
    <>
      <p className="mt-3 text-[11px] uppercase tracking-[.16em] text-grey">
        {items.length} saved · prices as when you saved them
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </ul>
    </>
  );
}
