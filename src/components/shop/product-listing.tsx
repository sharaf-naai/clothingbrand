import Link from "next/link";
import { ProductListQuery, type Section } from "@/contracts/products";
import { listProducts } from "@/lib/api/products";
import { ProductCard } from "./product-card";

// shortcut: categories are the §6 starters, hardcoded; read them from the API once a categories endpoint exists
const categories = [
  { slug: undefined, name: "All" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "tops", name: "Tops" },
  { slug: "bottoms", name: "Bottoms" },
  { slug: "accessories", name: "Accessories" },
];

const sorts = [
  { value: "newest", name: "Newest" },
  { value: "price-asc", name: "Price, low to high" },
  { value: "price-desc", name: "Price, high to low" },
] as const;

type Props = {
  title: string;
  section: Section;
  basePath: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const filterLink = (active: boolean) =>
  `inline-flex min-h-11 items-center ${active ? "underline decoration-1 underline-offset-[6px]" : "text-grey hover:text-ink"}`;

// Woman / Man listing. Filters and sort are plain links (?category=, ?sort=, ?page=), so it works without JS.
export async function ProductListing({ title, section, basePath, searchParams }: Props) {
  // A bad or hand-edited query string falls back to the defaults instead of erroring.
  const parsed = ProductListQuery.safeParse({ ...(await searchParams), section });
  const query = parsed.success ? parsed.data : ProductListQuery.parse({ section });
  const { items, page, pageSize, total } = await listProducts(query);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Changing category or sort goes back to page 1; defaults stay out of the URL.
  const href = (next: { category?: string; sort?: string; page?: number }) => {
    const merged = { category: query.category, sort: query.sort, ...next };
    const params = new URLSearchParams();
    if (merged.category) params.set("category", merged.category);
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <section className="px-5 pb-24 pt-10 sm:px-12 sm:pt-16">
      <div className="flex items-end justify-between gap-6 border-b border-stone pb-6">
        <h1 className="font-serif text-5xl leading-none tracking-[-0.02em] sm:text-7xl">{title}</h1>
        <p className="text-[11px] uppercase tracking-[.16em] text-grey">
          {total} {total === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <div className="flex flex-col gap-1 py-3 text-xs uppercase tracking-[.12em] sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Categories">
          <ul className="flex flex-wrap gap-x-6">
            {categories.map((c) => {
              const active = query.category === c.slug;
              return (
                <li key={c.name}>
                  <Link href={href({ category: c.slug })} aria-current={active ? "page" : undefined} className={filterLink(active)}>
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <nav aria-label="Sort">
          <ul className="flex flex-wrap gap-x-6">
            {sorts.map((s) => {
              const active = query.sort === s.value;
              return (
                <li key={s.value}>
                  <Link href={href({ sort: s.value })} aria-current={active ? "page" : undefined} className={filterLink(active)}>
                    {s.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      ) : (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl italic">Nothing here yet.</p>
          <Link href={basePath} className="mt-4 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
            See everything <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-16 flex items-center justify-center gap-8 text-xs uppercase tracking-[.12em]">
          {page > 1 ? <Link href={href({ page: page - 1 })} className={filterLink(false)}>← Previous</Link> : <span />}
          <span className="text-grey">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={href({ page: page + 1 })} className={filterLink(false)}>Next →</Link> : <span />}
        </nav>
      )}
    </section>
  );
}
