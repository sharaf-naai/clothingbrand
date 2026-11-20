"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { CheckoutRequest, SHIP_TO, SHIPPING, shippingFor } from "@/contracts/checkout";
import { ApiRequestError } from "@/contracts/errors";
import { recheckCart } from "@/lib/api/cart";
import { placeOrder } from "@/lib/api/checkout";
import { cart, cartTotals, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";

const label = "text-[11px] uppercase tracking-[.16em] text-grey";
const section = "border-t border-stone pt-6";
const input =
  "mt-1 block min-h-11 w-full border-b border-stone bg-transparent text-sm focus:border-ink aria-[invalid=true]:border-burgundy";

type Errors = Record<string, string>;

function Field(props: { name: string; path: string; label: string; errors: Errors; type?: string; autoComplete: string; optional?: boolean }) {
  const id = `f-${props.name}`;
  const err = props.errors[props.path];
  return (
    <div>
      <label htmlFor={id} className={label}>
        {props.label}
        {props.optional && " (optional)"}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-err` : undefined}
        className={input}
      />
      {err && (
        <p id={`${id}-err`} className="mt-1 text-xs text-burgundy">
          {err}
        </p>
      )}
    </div>
  );
}

const noop = () => () => {};

// Guest checkout. `order` is set when Stripe (or the mock) sends the buyer back after paying.
export function CheckoutForm({ order }: { order?: string }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false); // the bag only exists in the browser
  const { lines, checking, notices } = useCart();
  const [placed, setPlaced] = useState(order);
  const [payment, setPayment] = useState<"COD" | "CARD">("COD");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order) cart.clear(); // back from a paid card order
    else recheckCart();
  }, [order]);

  const { subtotal } = cartTotals(lines);
  const shipping = shippingFor(subtotal.amount);
  const total = { ...subtotal, amount: subtotal.amount + shipping.amount };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    const parsed = CheckoutRequest.safeParse({
      items: lines.map(({ variantId, qty }) => ({ variantId, qty })),
      customer: { email: get("email"), phone: get("phone"), name: get("name") },
      address: { line1: get("line1"), line2: get("line2") || undefined, city: get("city"), postalCode: get("postalCode"), country: get("country") },
      paymentMethod: payment,
    });
    setFailure(undefined);
    if (!parsed.success) {
      const next = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
      setErrors(next);
      // Move focus to the first field with an error so keyboard and screen reader users land on it.
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await placeOrder(parsed.data);
      if (res.paymentMethod === "CARD") {
        window.location.assign(res.checkoutUrl); // the bag is cleared when Stripe sends the buyer back
        return;
      }
      cart.clear();
      setPlaced(res.orderNumber);
      window.scrollTo(0, 0);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "CART_CHANGED") {
        await recheckCart();
        setFailure("Your bag changed since you opened it. Check the updates above, then place your order again.");
      } else if (err instanceof ApiRequestError && err.fields) {
        setErrors(err.fields);
      } else {
        setFailure("Something went wrong and your order was not placed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <section className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className={label}>Order {placed}</p>
        <h1 className="mt-4 font-serif text-5xl">Thank you.</h1>
        <p className="mt-6 text-sm leading-relaxed">
          Your order is confirmed. We&apos;ll send you a message when it ships.
          <br />
          This is a concept store: nothing will be delivered or charged.
        </p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
          Back to the shop <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </section>
    );
  }

  if (!mounted) return <div className="min-h-svh" />;

  if (lines.length === 0) {
    return (
      <section className="px-5 py-24 text-center">
        <h1 className="font-serif text-4xl italic">Your bag is empty.</h1>
        {notices.length > 0 && <p className="mt-4 text-xs text-burgundy">{notices.join(" ")}</p>}
        <Link href="/woman" className="mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
          Shop Woman <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-12 px-5 pb-24 pt-10 sm:px-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
      <form noValidate onSubmit={submit} className="flex max-w-xl flex-col gap-8">
        <h1 className="font-serif text-5xl leading-none tracking-[-0.02em]">Checkout</h1>

        {notices.length > 0 && (
          <ul aria-live="polite" className="space-y-1 border-l border-burgundy pl-3 text-xs text-burgundy">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}

        <fieldset className={`${section} grid gap-5`}>
          <legend className={label}>Contact</legend>
          <Field name="email" path="customer.email" label="Email" type="email" autoComplete="email" errors={errors} />
          <Field name="phone" path="customer.phone" label="Phone, for delivery updates" type="tel" autoComplete="tel" errors={errors} />
        </fieldset>

        <fieldset className={`${section} grid gap-5`}>
          <legend className={label}>Delivery</legend>
          <Field name="name" path="customer.name" label="Full name" autoComplete="name" errors={errors} />
          <Field name="line1" path="address.line1" label="Address" autoComplete="address-line1" errors={errors} />
          <Field name="line2" path="address.line2" label="Apartment, floor" autoComplete="address-line2" optional errors={errors} />
          <div className="grid grid-cols-2 gap-5">
            <Field name="postalCode" path="address.postalCode" label="Postal code" autoComplete="postal-code" errors={errors} />
            <Field name="city" path="address.city" label="City" autoComplete="address-level2" errors={errors} />
          </div>
          <div>
            <label htmlFor="f-country" className={label}>
              Country
            </label>
            <select
              id="f-country"
              name="country"
              autoComplete="country"
              defaultValue=""
              aria-invalid={errors["address.country"] ? true : undefined}
              aria-describedby={errors["address.country"] ? "f-country-err" : undefined}
              className={input}
            >
              <option value="" disabled>
                Choose a country
              </option>
              {Object.entries(SHIP_TO).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            {errors["address.country"] && (
              <p id="f-country-err" className="mt-1 text-xs text-burgundy">
                {errors["address.country"]}
              </p>
            )}
          </div>
        </fieldset>

        <fieldset className={`${section} grid gap-2`}>
          <legend className={label}>Payment</legend>
          {(
            [
              ["COD", "Cash on delivery", "Pay when your order arrives."],
              ["CARD", "Card", "Stripe test mode: no real payment is taken."],
            ] as const
          ).map(([value, title, hint]) => (
            <label key={value} className={`flex min-h-11 cursor-pointer items-start gap-3 border p-4 ${payment === value ? "border-ink" : "border-stone"}`}>
              <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="mt-0.5 accent-ink" />
              <span>
                <span className="block text-xs uppercase tracking-[.12em]">{title}</span>
                <span className="mt-1 block text-xs text-grey">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {failure && (
          <p role="alert" className="text-sm text-burgundy">
            {failure}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || checking}
          className="flex min-h-12 w-full items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory disabled:bg-stone disabled:text-grey"
        >
          {busy ? "Placing order…" : checking ? "Checking stock…" : `${payment === "COD" ? "Place order" : "Continue to payment"} · ${formatMoney(total)}`}
        </button>
      </form>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-10 lg:self-start">
        <h2 id="summary-title" className={label}>
          Your bag
        </h2>
        <ul className="mt-4 divide-y divide-stone border-y border-stone">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-4 py-4 text-xs">
              <div>
                <p className="uppercase tracking-[.12em]">{l.name}</p>
                <p className="mt-1 text-grey">
                  {l.color}
                  {l.size !== "ONE" && ` · ${l.size}`} · Qty {l.qty}
                </p>
              </div>
              <p className="shrink-0">{formatMoney({ ...l.price, amount: l.price.amount * l.qty })}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-xs">
          <dt>Subtotal</dt>
          <dd className="text-right">{formatMoney(subtotal)}</dd>
          <dt>Shipping</dt>
          <dd className="text-right">{shipping.amount === 0 ? "Free" : formatMoney(shipping)}</dd>
          <dt className="pt-2 uppercase tracking-[.12em]">Total</dt>
          <dd className="pt-2 text-right uppercase tracking-[.12em]">{formatMoney(total)}</dd>
        </dl>
        {shipping.amount > 0 && (
          <p className="mt-3 text-xs text-grey">Free shipping from {formatMoney({ amount: SHIPPING.freeFrom, currency: SHIPPING.currency })}.</p>
        )}
      </aside>
    </div>
  );
}
