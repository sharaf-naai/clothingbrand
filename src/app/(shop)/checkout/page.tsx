import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Checkout · VEYL", robots: { index: false } };

async function Checkout({ searchParams }: { searchParams: PageProps<"/checkout">["searchParams"] }) {
  const { order } = await searchParams;
  // Only a well-formed order number is shown back on the confirmation.
  return <CheckoutForm order={typeof order === "string" && /^VY-\d{6}$/.test(order) ? order : undefined} />;
}

export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-svh" />}>
          <Checkout searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
