import { SHIP_TO } from "@/contracts/checkout";

// Shared form controls (checkout, address book, sign-in). Errors are keyed by schema path ("address.city").
export type Errors = Record<string, string>;

export const fieldLabel = "text-[11px] uppercase tracking-[.16em] text-grey";
export const fieldInput =
  "mt-1 block min-h-11 w-full border-b border-stone bg-transparent text-sm focus:border-ink aria-[invalid=true]:border-burgundy";

function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-err`} className="mt-1 text-xs text-burgundy">
      {error}
    </p>
  ) : null;
}

export function Field(props: {
  name: string;
  path: string;
  label: string;
  errors: Errors;
  type?: string;
  autoComplete: string;
  optional?: boolean;
  id?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  placeholder?: string;
}) {
  const id = props.id ?? `f-${props.name}`;
  const err = props.errors[props.path];
  return (
    <div>
      <label htmlFor={id} className={fieldLabel}>
        {props.label}
        {props.optional && " (optional)"}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        placeholder={props.placeholder}
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-err` : undefined}
        className={fieldInput}
      />
      <ErrorText id={id} error={err} />
    </div>
  );
}

export function CountrySelect({ errors, path, id = "f-country" }: { errors: Errors; path: string; id?: string }) {
  const err = errors[path];
  return (
    <div>
      <label htmlFor={id} className={fieldLabel}>
        Country
      </label>
      <select
        id={id}
        name="country"
        autoComplete="country"
        defaultValue=""
        aria-invalid={err ? true : undefined}
        aria-describedby={err ? `${id}-err` : undefined}
        className={fieldInput}
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
      <ErrorText id={id} error={err} />
    </div>
  );
}
