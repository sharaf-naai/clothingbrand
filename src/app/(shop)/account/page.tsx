import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/shop/account-view";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Account · VEYL", robots: { index: false } };

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Suspense: the session cookie is request data (cacheComponents) */}
        <Suspense fallback={<div className="min-h-svh" />}>
          <AccountView />
        </Suspense>
      </main>
    </>
  );
}
