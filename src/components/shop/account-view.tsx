import Link from "next/link";
import { deleteAddressAction, logoutAction } from "@/app/(shop)/account/actions";
import { MAX_ADDRESSES } from "@/contracts/account";
import { SHIP_TO } from "@/contracts/checkout";
import { getMe, listAddresses, listMyOrders } from "@/lib/api/account";
import { useMocks } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";
import { AddressForm, SignInForm } from "./account-forms";
import { fieldLabel as label } from "./form-field";
import { statusName } from "./order-view";

const textButton = "inline-flex min-h-11 items-center text-[11px] uppercase tracking-[.14em] text-grey underline decoration-1 underline-offset-4 hover:text-ink";

// /account: sign-in when signed out; orders and address book when signed in.
export async function AccountView() {
  const me = await getMe();

  if (!me) {
    return (
      <section className="mx-auto max-w-md px-5 pb-24 pt-16">
        <h1 className="font-serif text-5xl leading-none tracking-[-0.02em]">Account</h1>
        <p className="mb-10 mt-4 text-sm leading-relaxed text-grey">Sign in with your email. No password: we send you a link.</p>
        <SignInForm mock={useMocks} />
      </section>
    );
  }

  const [orders, addresses] = await Promise.all([listMyOrders(), listAddresses()]);

  return (
    <section className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-6">
        <div>
          <h1 className="font-serif text-5xl leading-none tracking-[-0.02em]">Account</h1>
          <p className={`${label} mt-3 normal-case tracking-normal`}>Signed in as {me.email}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={textButton}>
            Sign out
          </button>
        </form>
      </div>

      <h2 className={`${label} mt-10`}>Orders</h2>
      {orders.items.length === 0 ? (
        <p className="mt-3 text-sm">
          No orders yet.{" "}
          <Link href="/drops" className="underline underline-offset-4">
            See the current drop
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-stone border-y border-stone">
          {orders.items.map((o) => (
            <li key={o.number}>
              <Link
                href={`/orders/${o.number}?token=${encodeURIComponent(o.token)}`}
                className="grid min-h-11 grid-cols-2 items-center gap-2 py-4 text-xs hover:bg-stone/30 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <span className="uppercase tracking-[.12em]">{o.number}</span>
                <span className="text-right text-grey sm:text-left">{formatDate(o.createdAt)}</span>
                <span>
                  {statusName(o.status)} · {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                </span>
                <span className="text-right">{formatMoney(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className={`${label} mt-12`}>Addresses</h2>
      {addresses.length === 0 && <p className="mt-3 text-sm">No saved addresses.</p>}
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="border border-stone p-4 text-xs leading-relaxed">
            <address className="not-italic">
              {a.name}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.postalCode} {a.city}
              <br />
              {SHIP_TO[a.country]}
              {a.phone && (
                <>
                  <br />
                  {a.phone}
                </>
              )}
            </address>
            <form action={deleteAddressAction}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className={textButton}>
                Remove<span className="sr-only"> address {a.line1}</span>
              </button>
            </form>
          </li>
        ))}
      </ul>
      {addresses.length < MAX_ADDRESSES ? (
        <details className="mt-6 border-t border-stone pt-4">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-xs uppercase tracking-[.14em]">Add an address</summary>
          <div className="mt-4 max-w-xl">
            <AddressForm />
          </div>
        </details>
      ) : (
        <p className="mt-4 text-xs text-grey">Your address book is full ({MAX_ADDRESSES}). Remove one to add another.</p>
      )}
    </section>
  );
}
