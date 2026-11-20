"use client";

import { useActionState } from "react";
import { addAddressAction, loginAction, mockOpenLinkAction, type AddressState, type LoginState } from "@/app/(shop)/account/actions";
import { CountrySelect, Field, fieldLabel } from "./form-field";

const button = "flex min-h-12 w-full items-center justify-center bg-ink text-xs uppercase tracking-[.14em] text-ivory disabled:bg-stone disabled:text-grey";

/** Email → magic link. `mock`: no email is sent, so offer the link right on the page. */
export function SignInForm({ mock }: { mock: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  if (state.sentTo) {
    return (
      <div aria-live="polite">
        <p className="font-serif text-3xl italic">Check your inbox.</p>
        <p className="mt-3 text-sm leading-relaxed">We sent a sign-in link to {state.sentTo}. It works once and expires soon.</p>
        {mock && (
          <form action={mockOpenLinkAction} className="mt-8">
            <input type="hidden" name="email" value={state.sentTo} />
            <button type="submit" className={button}>
              Open the link (demo)
            </button>
            <p className="mt-2 text-xs text-grey">Demo mode: no email is sent, this button does what the link would.</p>
          </form>
        )}
      </div>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-6">
      <Field name="email" path="email" label="Email" type="email" autoComplete="email" errors={state.error ? { email: state.error } : {}} />
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Sending…" : "Send me a sign-in link"}
      </button>
    </form>
  );
}

/** New address. The form clears itself after a successful save. */
export function AddressForm() {
  const [state, action, pending] = useActionState<AddressState, FormData>(addAddressAction, {});
  const errors = state.errors ?? {};
  return (
    <form action={action} noValidate className="grid gap-5">
      <Field id="a-name" name="name" path="name" label="Full name" autoComplete="name" errors={errors} />
      <Field id="a-phone" name="phone" path="phone" label="Phone" type="tel" autoComplete="tel" optional errors={errors} />
      <Field id="a-line1" name="line1" path="line1" label="Address" autoComplete="address-line1" errors={errors} />
      <Field id="a-line2" name="line2" path="line2" label="Apartment, floor" autoComplete="address-line2" optional errors={errors} />
      <div className="grid grid-cols-2 gap-5">
        <Field id="a-postal" name="postalCode" path="postalCode" label="Postal code" autoComplete="postal-code" errors={errors} />
        <Field id="a-city" name="city" path="city" label="City" autoComplete="address-level2" errors={errors} />
      </div>
      <CountrySelect id="a-country" path="country" errors={errors} />
      {errors.form && (
        <p role="alert" className="text-sm text-burgundy">
          {errors.form}
        </p>
      )}
      <p aria-live="polite" className={fieldLabel}>
        {state.ok ? "Address saved." : ""}
      </p>
      <button type="submit" disabled={pending} className={button}>
        {pending ? "Saving…" : "Save address"}
      </button>
    </form>
  );
}
