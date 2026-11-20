import Link from "next/link";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/woman", label: "Woman" },
      { href: "/man", label: "Man" },
      { href: "/drops", label: "Drops" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "You",
    links: [
      { href: "/account", label: "Account" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
];

const label = "text-[11px] uppercase tracking-[.16em] text-grey";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone px-5 pb-10 pt-12 sm:px-12">
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <Link href="/" className="font-serif text-3xl font-medium tracking-[-0.02em]">
            VEYL
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-grey">
            A concept store made for a portfolio. Nothing here is for sale: no real orders, payments or customer data.
          </p>
        </div>
        <div className="flex gap-16">
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className={label}>{c.title}</h2>
              <ul className="mt-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-11 items-center text-xs uppercase tracking-[.12em] hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <p className={`${label} mt-12`}>© 2026 VEYL · concept project</p>
    </footer>
  );
}
