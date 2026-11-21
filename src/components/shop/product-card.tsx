import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/contracts/products";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product: p }: { product: ProductSummary }) {
  return (
    <li>
      <Link href={`/products/${p.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone">
          {p.images[0] && (
            <Image
              src={p.images[0]}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.02]"
            />
          )}
          {!p.inStock && (
            <span className="absolute left-3 top-3 text-[11px] uppercase tracking-[.16em]">Sold out</span>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3 text-xs uppercase tracking-[.12em]">
          <h2 className="font-normal group-hover:underline group-hover:underline-offset-4">{p.name}</h2>
          <span className="shrink-0">{formatMoney(p.price)}</span>
        </div>
        <p className="sr-only">Colours: {p.colors.map((c) => c.name).join(", ")}</p>
        <div aria-hidden="true" className="mt-2 flex gap-1.5">
          {p.colors.map((c) => (
            <span key={c.name} className="size-2.5 rounded-full border border-grey/40" style={{ background: c.hex }} />
          ))}
        </div>
      </Link>
    </li>
  );
}
