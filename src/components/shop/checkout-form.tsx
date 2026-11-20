"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CheckoutRequest, SHIPPING, shippingFor, type PaymentMethod } from "@/contracts/checkout";
import { ApiRequestError } from "@/contracts/errors";
import { recheckCart } from "@/lib/api/cart";
import { placeOrder } from "@/lib/api/checkout";
import { cartTotals, useCart } from "@/lib/cart";
import { checkDemoCard } from "@/lib/demo-payment";
import { formatMoney } from "@/lib/format";
import { CountrySelect, Field, fieldLabel, type Errors } from "./form-field";

const label = fieldLabel;
const section = "border-t border-stone pt-6";

const noop = () => () => {};

// Guest checkout. On success it goes to the order page (/orders/<number>?token=…&placed=1), which empties the bag.
export function CheckoutForm() {
  const router = useRouter();
  const mounted = useSyncExternalStore(noop, () => true, () => false); // the bag only exists in the browser
  const { lines, checking, notices } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const wallet = useRef<HTMLDialogElement>(null);
  const pending = useRef<CheckoutRequest | null>(null); // the order waiting for the simulated PayPal approval

  useEffect(() => {
    recheckCart();
  }, []);

  const { subtotal } = cartTotals(lines);
  const shipping = shippingFor(subtotal.amount);
  const total = { ...subtotal, amount: subtotal.amount + shipping.amount };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    // The card is checked here, in the browser; only its last 4 digits go into the request.
    const card = payment === "CARD" ? checkDemoCard({ number: get("demoCardNumber"), expiry: get("demoCardExpiry"), cvc: get("demoCardCvc") }) : null;
    const parsed = CheckoutRequest.safeParse({
      items: lines.map(({ variantId, qty }) => ({ variantId, qty })),
      customer: { email: get("email"), phone: get("phone"), name: get("name") },
      address: { line1: get("line1"), line2: get("line2") || undefined, city: get("city"), postalCode: get("postalCode"), country: get("country") },
      paymentMethod: payment,
      card: card?.ok ? { last4: card.last4 } : payment === "CARD" ? { last4: "0000" } : undefined,
    });
    setFailure(undefined);
    const next = {
      ...(parsed.success ? {} : Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]))),
      ...(card && !card.ok && !card.declined ? card.errors : {}),
    };
    if (Object.keys(next).length || !parsed.success) {
      setErrors(next);
      // Move focus to the first field with an error so keyboard and screen reader users land on it.
      requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());
      return;
    }
    setErrors({});
    if (card && !card.ok) return setFailure("Your card was declined (demo card 4000 0000 0000 0002). Try 4242 4242 4242 4242.");
    if (payment === "PAYPAL") {
      pending.current = parsed.data;
      return wallet.current?.showModal();
    }
    await place(parsed.data);
  }

  async function place(req: CheckoutRequest) {
    setBusy(true);
    try {
      if (req.paymentMethod === "CARD") await new Promise((r) => setTimeout(r, 900)); // feels like a payment
      const res = await placeOrder(req);
      router.push(`/orders/${res.orderNumber}?token=${encodeURIComponent(res.token)}&placed=1`);
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
          <CountrySelect errors={errors} path="address.country" />
        </fieldset>

        <fieldset className={`${section} grid gap-2`}>
          <legend className={label}>Payment</legend>
          {(
            [
              ["COD", "Cash on delivery", "Pay when your order arrives."],
              ["CARD", "Card", "Demo: test cards only, nothing is charged."],
              ["PAYPAL", "PayPal", "Demo: a simulated approval, no account needed."],
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
          {payment === "CARD" && (
            <div className="mt-3 grid gap-5 border border-stone p-4">
              <p className="text-xs leading-relaxed">
                <strong className="font-medium">Demo only: don&apos;t enter a real card.</strong> Nothing is charged and the number never leaves
                this page. Use <span className="whitespace-nowrap">4242 4242 4242 4242</span>, any future date, any CVC.{" "}
                <span className="whitespace-nowrap">4000 0000 0000 0002</span> is declined.
              </p>
              {/* autoComplete off: keep browsers from offering real saved cards */}
              <Field name="demoCardNumber" path="cardNumber" label="Card number" autoComplete="off" inputMode="numeric" placeholder="4242 4242 4242 4242" errors={errors} />
              <div className="grid grid-cols-2 gap-5">
                <Field name="demoCardExpiry" path="cardExpiry" label="Expiry (MM/YY)" autoComplete="off" inputMode="numeric" placeholder="12/28" errors={errors} />
                <Field name="demoCardCvc" path="cardCvc" label="CVC" autoComplete="off" inputMode="numeric" placeholder="123" errors={errors} />
              </div>
            </div>
          )}
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
          {busy
            ? payment === "CARD"
              ? "Processing payment…"
              : "Placing order…"
            : checking
              ? "Checking stock…"
              : { COD: "Place order", CARD: "Pay", PAYPAL: "Continue to PayPal" }[payment] + ` · ${formatMoney(total)}`}
        </button>
      </form>

      {/* Simulated PayPal approval: plain dialog, no third-party branding */}
      <dialog ref={wallet} aria-labelledby="wallet-title" className="m-auto w-[min(92vw,24rem)] bg-ivory p-6 text-ink backdrop:bg-ink/25">
        <p className={label}>Demo wallet</p>
        <h2 id="wallet-title" className="mt-3 font-serif text-3xl">
          Approve {formatMoney(total)}?
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-grey">This simulates paying with PayPal. No account is used and no money moves.</p>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => {
              wallet.current?.close();
              if (pending.current) place(pending.current);
            }}
            className="flex min-h-12 items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory"
          >
            Approve payment
          </button>
          <button type="button" onClick={() => wallet.current?.close()} className="flex min-h-11 items-center justify-center text-xs uppercase tracking-[.14em] underline decoration-1 underline-offset-[6px]">
            Cancel
          </button>
        </div>
      </dialog>

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
