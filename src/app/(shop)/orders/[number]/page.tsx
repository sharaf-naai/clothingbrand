import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ClearBag } from "@/components/shop/clear-bag";
import { OrderView } from "@/components/shop/order-view";
import { SiteHeader } from "@/components/shop/site-header";
import { getOrder } from "@/lib/api/orders";

// Private: reachable only with the token from checkout or the confirmation email.
export const metadata: Metadata = { title: "Your order · VEYL", robots: { index: false } };

type Props = PageProps<"/orders/[number]">;

async function OrderPage({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const [{ number }, sp] = await Promise.all([params, searchParams]);
  const token = typeof sp.token === "string" ? sp.token : "";
  const order = token ? await getOrder(number, token) : null;
  if (!order) notFound();
  const placed = sp.placed === "1";
  return (
    <>
      {placed && <ClearBag />}
      <OrderView order={order} placed={placed} />
    </>
  );
}

export default function Page({ params, searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-svh" />}>
          <OrderPage params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}
