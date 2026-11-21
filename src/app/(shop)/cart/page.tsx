import type { Metadata } from "next";
import { CartPage } from "@/components/shop/cart-page";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Bag · VEYL", robots: { index: false } };

export default function Cart() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CartPage />
      </main>
    </>
  );
}
