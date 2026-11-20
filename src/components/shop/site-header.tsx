import Form from "next/form";
import Link from "next/link";
import { BagButton } from "./bag-buttons";
import { HeaderSearch } from "./header-search";

const nav = [
  { href: "/woman", label: "Woman" },
  { href: "/man", label: "Man" },
  { href: "/drops", label: "Drops" },
];

const item = "inline-flex min-h-11 items-center";

// Transparent header (CLAUDE.md §8.1). `overlay`: sits over the home hero, whose wordmark is the logo.
// Otherwise it sits in the page flow and shows a small VEYL link home.
export function SiteHeader({ className = "", overlay = false }: { className?: string; overlay?: boolean }) {
  return (
    <header
      className={`${overlay ? "absolute inset-x-0 top-0" : "relative"} z-[5] flex items-center justify-between px-5 pt-3 text-xs uppercase tracking-[.12em] sm:px-12 sm:pt-4 ${className}`}
    >
      {!overlay && (
        <Link
          href="/"
          className="absolute left-1/2 top-3 inline-flex min-h-11 -translate-x-1/2 items-center font-serif text-2xl font-medium normal-case tracking-[-0.02em] sm:top-4"
        >
          VEYL
        </Link>
      )}
      {/* Mobile: native disclosure, no JS */}
      <details className="relative sm:hidden">
        <summary className={`${item} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>Menu</summary>
        <nav aria-label="Main" className="absolute left-0 top-full flex w-[calc(100vw-2.5rem)] max-w-xs flex-col bg-ivory py-2">
          <search>
            <Form action="/search" className="mb-2 border-b border-ink">
              <label htmlFor="menu-q" className="sr-only">
                Search the shop
              </label>
              <input id="menu-q" name="q" type="search" placeholder="Search" maxLength={100} className="min-h-11 w-full bg-transparent normal-case tracking-normal placeholder:text-grey" />
            </Form>
          </search>
          {[...nav, { href: "/account", label: "Account" }].map((l) => (
            <Link key={l.href} href={l.href} className={item}>
              {l.label}
            </Link>
          ))}
        </nav>
      </details>

      <nav aria-label="Main" className="hidden items-center gap-3 sm:flex">
        {nav.map((l, i) => (
          <span key={l.href} className="flex items-center gap-3">
            {i > 0 && <span aria-hidden="true">·</span>}
            <Link href={l.href} className={item}>
              {l.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <HeaderSearch className={`${item} hidden min-w-11 justify-center sm:inline-flex`} />
        <Link href="/account" className={`${item} hidden sm:inline-flex`}>
          Account
        </Link>
        <BagButton className={item} />
      </div>
    </header>
  );
}
