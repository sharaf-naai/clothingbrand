import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/shop/site-header";

export const metadata: Metadata = { title: "Not found · VEYL" };

const textLink = "inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
        <p className="font-serif text-[30vw] font-medium leading-[0.8] tracking-[-0.04em] sm:text-[12rem]" aria-hidden="true">
          404
        </p>
        <h1 className="mt-6 font-serif text-3xl italic">This page doesn&apos;t exist.</h1>
        <p className="mt-6 flex flex-wrap justify-center gap-x-8">
          <Link href="/" className={textLink}>
            Home
          </Link>
          <Link href="/woman" className={textLink}>
            Woman
          </Link>
          <Link href="/man" className={textLink}>
            Man
          </Link>
        </p>
      </main>
    </>
  );
}
