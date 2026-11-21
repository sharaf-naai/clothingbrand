import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api/products";
import { formatMoney } from "@/lib/format";
import { selectVariant } from "@/lib/variants";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const label = "text-[11px] uppercase tracking-[.16em] text-grey";

// Product page. Colour and size are links (?color=, ?size=), so selection works without JS and can be shared.
export async function ProductDetail({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const p = await getProduct(slug);
  if (!p) notFound();

  const { colors, color, sizes, size, variant } = selectVariant(p, one(sp.color), one(sp.size));
  const href = (c: string, s?: string) => `/products/${p.slug}?color=${encodeURIComponent(c)}${s ? `&size=${s}` : ""}`;
  const soldOut = sizes.every((s) => s.stock === 0);
  const showSizes = !(sizes.length === 1 && sizes[0].size === "ONE");

  // shortcut: "Add to bag" does nothing yet, wire it to the cart once the cart contract and drawer exist
  const cta = soldOut
    ? "Sold out"
    : !variant
      ? "Select a size"
      : variant.stock === 0
        ? "Size sold out"
        : `Add to bag · ${formatMoney(variant.price)}`;

  return (
    <article className="grid gap-8 px-5 pb-24 pt-6 sm:px-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:pt-10">
      {/* Images: stacked, full width of their column */}
      <div className="flex flex-col gap-4">
        {p.images.length > 0 ? (
          p.images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] bg-stone">
              <Image
                src={src}
                alt={i === 0 ? `${p.name} in ${color.name}` : ""}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                preload={i === 0}
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <div className="aspect-[4/5] bg-stone" />
        )}
      </div>

      {/* Info, sticky beside the images on desktop */}
      <div className="lg:sticky lg:top-10 lg:self-start">
        <p className={label}>
          {p.drop ? `Drop ${p.drop.number} · ${p.drop.name}` : p.category.name}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.01em]">{p.name}</h1>
        <p className="mt-2 text-sm">{formatMoney(variant?.price ?? p.price)}</p>

        <div className="mt-8">
          <p id="colour-label" className={label}>
            Colour · <span className="text-ink">{color.name}</span>
          </p>
          <ul aria-labelledby="colour-label" className="mt-2 flex gap-1">
            {colors.map((c) => {
              const active = c.name === color.name;
              return (
                <li key={c.name}>
                  <Link
                    href={href(c.name, size)}
                    scroll={false}
                    replace
                    aria-label={c.name}
                    aria-current={active ? "true" : undefined}
                    className="flex size-11 items-center justify-center"
                  >
                    <span
                      className={`size-6 rounded-full border border-grey/40 ${active ? "outline outline-1 outline-offset-[3px] outline-ink" : ""}`}
                      style={{ background: c.hex }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {showSizes && (
          <div className="mt-6">
            <p id="size-label" className={label}>
              Size
            </p>
            <ul aria-labelledby="size-label" className="mt-2 grid grid-cols-5 gap-1 text-xs">
              {sizes.map((s) => {
                const active = s.size === size;
                const out = s.stock === 0;
                return (
                  <li key={s.size}>
                    {out ? (
                      <span className="flex min-h-11 items-center justify-center border border-stone text-grey line-through">
                        {s.size}
                        <span className="sr-only">, sold out</span>
                      </span>
                    ) : (
                      <Link
                        href={href(color.name, s.size)}
                        scroll={false}
                        replace
                        aria-current={active ? "true" : undefined}
                        className={`flex min-h-11 items-center justify-center border ${active ? "border-ink bg-ink text-ivory" : "border-stone hover:border-ink"}`}
                      >
                        {s.size}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <button
          type="button"
          disabled={!variant || variant.stock === 0}
          className="mt-8 flex min-h-12 w-full items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory disabled:bg-stone disabled:text-grey"
        >
          {cta}
        </button>
        {variant && variant.stock > 0 && variant.stock <= 3 && (
          <p className="mt-3 text-xs text-grey">Only {variant.stock} left</p>
        )}

        <p className="mt-10 text-sm leading-relaxed">{p.description}</p>
        <p className={`${label} mt-6`}>
          {p.section === "UNISEX" ? "Unisex" : p.section === "WOMAN" ? "Woman" : "Man"} · {p.category.name}
        </p>
      </div>
    </article>
  );
}
