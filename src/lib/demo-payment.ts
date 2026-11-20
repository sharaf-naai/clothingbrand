// Simulated card payment (concept store: CLAUDE.md §12). Runs only in the browser and never sends the number
// anywhere: checkout receives { last4 } and nothing else. Only these test numbers are accepted.
export const DEMO_CARDS = {
  "4242424242424242": "approve",
  "5555555555554444": "approve",
  "4000000000000002": "decline",
} as const;

export type DemoCardResult =
  | { ok: true; last4: string }
  | { ok: false; declined: true }
  | { ok: false; declined?: false; errors: Record<string, string> };

/** number "4242 4242 …", expiry "MM/YY", cvc "123"; `now` for testing. */
export function checkDemoCard(input: { number: string; expiry: string; cvc: string }, now = new Date()): DemoCardResult {
  const number = input.number.replace(/[\s-]/g, "");
  const errors: Record<string, string> = {};
  const outcome = DEMO_CARDS[number as keyof typeof DEMO_CARDS];
  if (!outcome) errors.cardNumber = "Demo only: use a test number such as 4242 4242 4242 4242";

  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(input.expiry.trim());
  const month = m ? Number(m[1]) : 0;
  if (!m || month < 1 || month > 12) errors.cardExpiry = "Enter the expiry as MM/YY";
  // A card is valid until the end of its expiry month.
  else if (new Date(Date.UTC(2000 + Number(m[2]), month, 1)) <= now) errors.cardExpiry = "This card has expired";

  if (!/^\d{3,4}$/.test(input.cvc.trim())) errors.cardCvc = "Enter the 3 or 4 digit code";

  if (Object.keys(errors).length) return { ok: false, errors };
  if (outcome === "decline") return { ok: false, declined: true };
  return { ok: true, last4: number.slice(-4) };
}
