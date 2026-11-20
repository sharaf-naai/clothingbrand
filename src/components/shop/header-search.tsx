"use client";

import Image from "next/image";
import Form from "next/form";
import Link from "next/link";
import { useRef, useState } from "react";
import type { ProductList } from "@/contracts/products";
import { listProducts } from "@/lib/api/products";
import { formatMoney } from "@/lib/format";

const PREVIEW = 6;
const textLink = "inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]";

export function SearchIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="7" cy="7" r="5" />
      <path d="m11 11 3.5 3.5" />
    </svg>
  );
}

// Header search: the icon opens a top sheet (native <dialog>) with results as you type.
// Enter goes to /search?q=… for the full results; without JS the icon is a plain link there.
export function HeaderSearch({ className }: { className: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(0);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<ProductList | null>(null);

  const close = () => ref.current?.close();

  function onInput(value: string) {
    setQ(value);
    clearTimeout(timer.current);
    const term = value.trim();
    const id = ++latest.current; // only the newest request may update the results
    if (!term) return setRes(null);
    timer.current = setTimeout(async () => {
      try {
        const r = await listProducts({ q: term.slice(0, 100), pageSize: PREVIEW });
        if (id === latest.current) setRes(r);
      } catch {
        if (id === latest.current) setRes(null);
      }
    }, 250);
  }

  return (
    <>
      <a
        href="/search"
        aria-label="Search"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          ref.current?.showModal();
        }}
      >
        <SearchIcon />
      </a>
      <dialog
        ref={ref}
        aria-label="Search"
        onClick={(e) => e.target === e.currentTarget && close()}
        className="search-overlay m-0 h-fit max-h-[85dvh] w-full max-w-none overflow-y-auto bg-ivory p-0 text-ink"
      >
        <div className="px-5 pb-8 pt-4 sm:px-12">
          <div className="flex justify-end">
            <button type="button" onClick={close} className="inline-flex min-h-11 items-center text-xs uppercase tracking-[.12em]">
              Close
            </button>
          </div>
          <search>
            <Form action="/search" onSubmit={close} className="flex items-end gap-4 border-b border-ink pb-2">
              <label htmlFor="header-q" className="sr-only">
                Search the shop
              </label>
              <input
                id="header-q"
                name="q"
                type="search"
                value={q}
                onChange={(e) => onInput(e.target.value)}
                maxLength={100}
                placeholder="Search"
                autoFocus
                autoComplete="off"
                className="min-h-11 w-full bg-transparent font-serif text-3xl placeholder:text-stone sm:text-5xl"
              />
              <button type="submit" className="inline-flex min-h-11 shrink-0 items-center text-xs uppercase tracking-[.14em]">
                Search <span aria-hidden="true">&nbsp;→</span>
              </button>
            </Form>
          </search>

          <p aria-live="polite" className="mt-4 text-[11px] uppercase tracking-[.16em] text-grey">
            {res && q.trim() ? `${res.total} ${res.total === 1 ? "result" : "results"}` : ""}
          </p>
          {res && q.trim() && res.items.length > 0 && (
            <>
              <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {res.items.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.slug}`} onClick={close} className="group flex items-center gap-4">
                      <span className="relative aspect-[4/5] w-12 shrink-0 bg-stone">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                      <span className="flex-1 text-xs uppercase tracking-[.12em] group-hover:underline group-hover:underline-offset-4">{p.name}</span>
                      <span className="text-xs">{formatMoney(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {res.total > res.items.length && (
                <Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={close} className={`${textLink} mt-4`}>
                  See all {res.total} results <span aria-hidden="true">&nbsp;→</span>
                </Link>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
