import Form from "next/form";
import Link from "next/link";
import { listProducts } from "@/lib/api/products";
import { ProductCard } from "./product-card";

const MAX_LENGTH = 100;
const PAGE = 50;
const label = "text-[11px] uppercase tracking-[.16em] text-grey";
const textLink = "inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// /search?q=…: a plain GET form, so it works without JS and results can be linked to.
export async function SearchResults({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, MAX_LENGTH) ?? "";
  // shortcut: first 50 results only, no paging; add page links like the listings if the catalogue grows
  const results = q ? await listProducts({ q, pageSize: PAGE }) : null;

  return (
    <section className="px-5 pb-24 pt-10 sm:px-12 sm:pt-16">
      <h1 className="sr-only">Search</h1>
      <search>
        <Form action="/search" className="flex items-end gap-4 border-b border-ink pb-2">
          <label htmlFor="q" className="sr-only">
            Search the shop
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={MAX_LENGTH}
            placeholder="Search"
            autoFocus={!q}
            autoComplete="off"
            className="min-h-11 w-full bg-transparent font-serif text-4xl placeholder:text-stone sm:text-6xl"
          />
          <button type="submit" className="inline-flex min-h-11 shrink-0 items-center text-xs uppercase tracking-[.14em]">
            Search <span aria-hidden="true">&nbsp;→</span>
          </button>
        </Form>
      </search>

      {results && (
        <>
          <h2 className={`${label} mt-6`}>
            {results.total} {results.total === 1 ? "result" : "results"} for “{q}”
            {results.total > PAGE && `, showing the first ${PAGE}`}
          </h2>
          {results.items.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {results.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center">
              <p className="font-serif text-3xl italic">Nothing matches “{q}”.</p>
              <p className="mt-4 flex justify-center gap-8">
                <Link href="/woman" className={textLink}>
                  Shop Woman
                </Link>
                <Link href="/man" className={textLink}>
                  Shop Man
                </Link>
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
