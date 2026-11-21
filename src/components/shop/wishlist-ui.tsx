"use client";

import Link from "next/link";
import type { ProductSummary } from "@/contracts/products";
import { useWishlist, wishlist } from "@/lib/wishlist";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2">
      <path d="M8 13.5S2 10 2 5.8A3 3 0 0 1 8 4.6a3 3 0 0 1 6 1.2C14 10 8 13.5 8 13.5z" />
    </svg>
  );
}

/** Heart toggle. `text` adds a "Save" / "Saved" label (product page); without it, icon only (cards). */
export function WishlistButton({ item, className = "", text = false }: { item: ProductSummary; className?: string; text?: boolean }) {
  const saved = useWishlist().some((i) => i.slug === item.slug);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={text ? undefined : `Save ${item.name} to wishlist`}
      onClick={() => wishlist.toggle(item)}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 ${className}`}
    >
      <Heart filled={saved} />
      {text && <span className="text-xs uppercase tracking-[.14em]">{saved ? "Saved to wishlist" : "Save to wishlist"}</span>}
    </button>
  );
}

/** Header link with the saved count. */
export function WishlistLink({ className }: { className: string }) {
  const count = useWishlist().length;
  return (
    <Link href="/wishlist" aria-label={`Wishlist, ${count} ${count === 1 ? "item" : "items"}`} className={`${className} gap-1.5`}>
      <Heart filled={false} />
      {count > 0 && <span aria-hidden="true">({count})</span>}
    </Link>
  );
}
