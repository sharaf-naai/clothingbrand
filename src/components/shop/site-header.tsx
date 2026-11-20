import Link from "next/link";

const nav = [
  { href: "/woman", label: "Woman" },
  { href: "/man", label: "Man" },
  { href: "/drops", label: "Drops" },
];

const item = "inline-flex min-h-11 items-center";

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3.5 3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2.5 5.5h11l-1 9h-9z" />
      <path d="M5.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
    </svg>
  );
}

// Transparent header that sits over the page (CLAUDE.md §8.1).
export function SiteHeader({ className = "" }: { className?: string }) {
  // shortcut: bag count is a static 0, wire to the cart once the cart drawer exists
  const bag = (
    <button type="button" aria-label="Bag, 0 items" className={`${item} gap-1.5`}>
      <BagIcon />
      <span aria-hidden="true">(0)</span>
    </button>
  );

  return (
    <header
      className={`absolute inset-x-0 top-0 z-[5] flex items-center justify-between px-5 pt-3 text-xs uppercase tracking-[.12em] sm:px-12 sm:pt-4 ${className}`}
    >
      {/* Mobile: native disclosure, no JS */}
      <details className="relative sm:hidden">
        <summary className={`${item} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>Menu</summary>
        <nav aria-label="Main" className="absolute left-0 top-full flex min-w-48 flex-col bg-ivory py-2">
          {[...nav, { href: "/search", label: "Search" }, { href: "/account", label: "Account" }].map((l) => (
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
        <Link href="/search" aria-label="Search" className={`${item} hidden min-w-11 justify-center sm:inline-flex`}>
          <SearchIcon />
        </Link>
        <Link href="/account" className={`${item} hidden sm:inline-flex`}>
          Account
        </Link>
        {bag}
      </div>
    </header>
  );
}
