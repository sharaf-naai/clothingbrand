import { connection } from "next/server";
import { getCurrentDrops } from "@/lib/api/drops";
import { listProducts } from "@/lib/api/products";
import { formatDate } from "@/lib/format";
import { ProductCard } from "./product-card";

const label = "text-[11px] uppercase tracking-[.16em] text-grey";

// /drops: the live drop with its pieces, then a teaser for the next one.
export async function DropsPage() {
  // Per request, not at build: a drop going live must show without a redeploy.
  await connection();
  const { current, next } = await getCurrentDrops();
  const pieces = current ? (await listProducts({ drop: current.number, pageSize: 50 })).items : [];

  return (
    <section className="px-5 pb-24 pt-10 sm:px-12 sm:pt-16">
      {current ? (
        <>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-stone pb-8">
            <h1 className="font-serif font-medium leading-[0.8] tracking-[-0.04em]">
              <span className={`${label} mb-3 block font-sans font-normal leading-none tracking-[.16em]`}>Drop</span>{" "}
              <span className="text-[40vw] sm:text-[14rem]">{current.number}</span>
            </h1>
            <div className="pb-2">
              <p className="font-serif text-4xl italic sm:text-5xl">{current.name}</p>
              <p className={`${label} mt-3`}>
                Live since {formatDate(current.releaseAt)} · {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {pieces.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </>
      ) : (
        <h1 className="border-b border-stone pb-8 font-serif text-5xl italic sm:text-7xl">No drop right now.</h1>
      )}

      {next && (
        <aside aria-labelledby="next-drop" className="mt-24 border-t border-stone pt-10 text-center">
          <p className={label}>Next</p>
          <h2 id="next-drop" className="mt-4 font-serif text-5xl sm:text-6xl">
            Drop {next.number} · <span className="italic">{next.name}</span>
          </h2>
          <p className={`${label} mt-4`}>Releases {formatDate(next.releaseAt)}</p>
        </aside>
      )}
    </section>
  );
}
