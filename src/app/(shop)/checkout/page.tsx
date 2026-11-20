import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Checkout · VEYL", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CheckoutForm />
      </main>
    </>
  );
}
