import Image from "next/image";
import Link from "next/link";
import { SHIP_TO } from "@/contracts/checkout";
import type { Order, OrderStatus } from "@/contracts/orders";
import { formatDate, formatMoney } from "@/lib/format";

const label = "text-[11px] uppercase tracking-[.16em] text-grey";
const names: Record<OrderStatus, string> = {
  NEW: "Received",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};
export const statusName = (s: OrderStatus) => names[s];
const steps = (["NEW", "CONFIRMED", "SHIPPED", "DELIVERED"] as const).map((status) => ({ status, name: names[status] }));

/** One order: progress, items, totals, delivery. `placed` = shown right after checkout. */
export function OrderView({ order: o, placed }: { order: Order; placed: boolean }) {
  const stopped = o.status === "CANCELLED" || o.status === "RETURNED";
  const at = steps.findIndex((s) => s.status === o.status);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-16">
      <p className={label}>
        Order {o.number} · {formatDate(o.createdAt)}
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.02em] sm:text-6xl">{placed ? "Thank you." : "Your order"}</h1>
      <p className="mt-4 text-sm leading-relaxed">
        {o.paymentMethod === "COD" ? "Cash on delivery: pay when it arrives." : o.paymentStatus === "PAID" ? "Paid by card." : "Card payment pending."}{" "}
        A confirmation is on its way to {o.customer.email}.
        <br />
        <span className="text-grey">This is a concept store: nothing will be delivered or charged.</span>
      </p>

      {stopped ? (
        <p className={`${label} mt-10 text-burgundy`}>{statusName(o.status)}</p>
      ) : (
        <ol className="mt-10 grid grid-cols-4 gap-2" aria-label="Order progress">
          {steps.map((s, i) => (
            <li key={s.status} aria-current={i === at ? "step" : undefined} className={`border-t-2 pt-2 ${i <= at ? "border-ink" : "border-stone"}`}>
              <span className={`text-[11px] uppercase tracking-[.12em] ${i <= at ? "text-ink" : "text-grey"}`}>{s.name}</span>
            </li>
          ))}
        </ol>
      )}

      <h2 className={`${label} mt-12`}>Items</h2>
      <ul className="mt-3 divide-y divide-stone border-y border-stone">
        {o.items.map((it) => (
          <li key={it.variantId} className="flex gap-4 py-4">
            <Link href={`/products/${it.slug}`} className="relative aspect-[4/5] w-16 shrink-0 bg-stone">
              {it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-cover" />}
              <span className="sr-only">{it.name}</span>
            </Link>
            <div className="flex flex-1 justify-between gap-4 text-xs">
              <div>
                <p className="uppercase tracking-[.12em]">{it.name}</p>
                <p className="mt-1 text-grey">
                  {it.color}
                  {it.size !== "ONE" && ` · ${it.size}`} · Qty {it.qty}
                </p>
              </div>
              <p className="shrink-0">{formatMoney(it.lineTotal)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-10 sm:grid-cols-2">
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-xs sm:order-2">
          <dt>Subtotal</dt>
          <dd className="text-right">{formatMoney(o.subtotal)}</dd>
          <dt>Shipping</dt>
          <dd className="text-right">{o.shipping.amount === 0 ? "Free" : formatMoney(o.shipping)}</dd>
          <dt className="pt-2 uppercase tracking-[.12em]">Total</dt>
          <dd className="pt-2 text-right uppercase tracking-[.12em]">{formatMoney(o.total)}</dd>
        </dl>
        <div>
          <h2 className={label}>Delivery</h2>
          <address className="mt-2 text-xs not-italic leading-relaxed">
            {o.customer.name}
            <br />
            {o.address.line1}
            {o.address.line2 && (
              <>
                <br />
                {o.address.line2}
              </>
            )}
            <br />
            {o.address.postalCode} {o.address.city}
            <br />
            {SHIP_TO[o.address.country]}
          </address>
        </div>
      </div>

      <Link href="/" className="mt-12 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
        Back to the shop <span aria-hidden="true">&nbsp;→</span>
      </Link>
    </article>
  );
}
