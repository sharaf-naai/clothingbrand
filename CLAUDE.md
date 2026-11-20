# VEYL — clothing store + admin dashboard

> Working name: **VEYL** (to be confirmed: rename in one commit with `git grep -l VEYL`).
> A **concept project** for our portfolios. The brand is made up. No real payments, no real customers, no real people's data.

This file is the single source of truth for both of us and for Claude Code. **Every PR that changes something described here updates this file in the same PR.**

---

## 1. The team and who owns what

| Who | Role | Owns |
|---|---|---|
| **Sharaf** | Frontend | Storefront UI, admin UI, design system, animations |
| **Zidane** | Backend | Database, API, auth, payments, emails/WhatsApp, admin permissions, seed data, deployment config |

- You can read and suggest changes anywhere, but **only edit outside your area through a PR the owner approves**.
- **Shared area:** `src/contracts/`, the API shapes. Changing it needs **both** approvals (see §5).
- `CODEOWNERS` enforces this on GitHub (§9).

---

## 2. What we're building

**Storefront** (public)
- Home (editorial hero, design picked from the canvas), Woman / Man / Drops listing pages, product page, search.
- Cart drawer, checkout with **cash on delivery** or **card (Stripe test mode)**, order confirmation.
- Customer account (orders, addresses), wishlist.
- Language: English only.

**Admin dashboard** at **`/admin`**
- Overview: sales, orders today, best sellers, low stock.
- Orders: list, filters, detail, status flow `NEW → CONFIRMED → SHIPPED → DELIVERED` (plus `CANCELLED`, `RETURNED`), WhatsApp/email update to the customer on each change.
- Products: create/edit, variants (size × colour), stock, images, publish/unpublish.
- Drops: numbered limited releases with a release date ("Drop 01").
- Customers, discount codes.

**Public demo login (for the portfolio):** at `/admin/login`, username `test` / password `test` signs in as the **DEMO** role (§7). A banner reads "Demo mode — data resets every night".

Design reference canvas: https://claude.ai/artifact/2BGGk4J4b2ZQZ6bkkwQocs (hero directions; the chosen one gets noted in §12).

---

## 3. Stack (agreed defaults)

- **Next.js** (App Router, TypeScript strict), one app for the storefront, `/admin` and `/api`.
- **Tailwind CSS**.
- **PostgreSQL** (Neon or Supabase) + **Prisma** ORM.
- **Auth.js** (credentials) for admin; customer accounts by email magic link.
- **Zod** for every API input and output (`src/contracts`).
- **Stripe** test mode for cards. **Resend** for emails. WhatsApp: `wa.me` links first, WhatsApp Cloud API later.
- Images: **Cloudinary** (or UploadThing). Hosting: **Vercel**, with a preview deployment for every PR.
- Package manager: **pnpm**. Node **20+**.

> If the backend later moves to a separate service (Node/Express, Laravel…), the **contracts in `src/contracts` stay the same**; only `API_BASE_URL` changes. The frontend never imports Prisma or server code.

---

## 4. Folder structure and ownership

```
/
├─ CLAUDE.md                 ← this file (both)
├─ .github/CODEOWNERS        (both)
├─ .env.example              (backend; frontend adds NEXT_PUBLIC_* vars)
├─ prisma/
│  ├─ schema.prisma          (backend)
│  └─ seed.ts                (backend) demo data, also used by the nightly reset
├─ public/                   (frontend) static images, fonts, icons
└─ src/
   ├─ app/
   │  ├─ (shop)/…            (frontend) storefront pages
   │  ├─ admin/…             (frontend) admin UI pages
   │  └─ api/…               (backend) route handlers
   ├─ components/            (frontend) ui/, shop/, admin/
   ├─ contracts/             (SHARED) zod schemas + inferred types, one file per resource
   ├─ lib/api/               (frontend) typed fetch functions that call /api, switch to mocks
   ├─ mocks/                 (frontend) fixtures typed with the contracts
   ├─ server/                (backend) db client, services, auth, payments, notifications
   └─ proxy.ts               (backend, not created yet) Next 16 name for middleware.ts: auth guard for /admin
```

Rules:
- Frontend code **only** talks to the backend through `src/lib/api/*`, which calls `/api/*`. No direct DB or `src/server` imports in components.
- Backend code never imports from `src/components`.

---

## 5. The contract between us (most important section)

All request and response shapes live in **`src/contracts/*.ts`** as Zod schemas; types come from `z.infer`. The frontend builds against them with **mocks** until the real endpoint exists.

**Workflow for a new feature:**
1. Whoever needs it opens a PR that adds or changes the schema in `src/contracts` + the endpoint in the table below. **Both approve.**
2. Frontend builds the UI using `src/mocks` (set `NEXT_PUBLIC_USE_MOCKS=true`).
3. Backend implements the endpoint and validates input and output with the same schema.
4. Frontend flips the mock off for that resource and tests against the preview deployment.

**Conventions:**
- JSON only. Money as **integer minor units** + currency code: `{ "amount": 4900, "currency": "EUR" }`. Never floats.
- Dates as ISO 8601 strings (UTC).
- Lists: `{ items: [...], page, pageSize, total }`. Query: `page`, `pageSize` (max 50), `sort`.
- Errors: HTTP status + `{ "error": { "code": "OUT_OF_STOCK", "message": "…", "fields": { … } } }`. Codes are UPPER_SNAKE and listed in `src/contracts/errors.ts`.
- Admin endpoints require a session; the DEMO role gets `403 DEMO_FORBIDDEN` on blocked actions (§7).

**Endpoints v1** (✅ = done, 🧪 = mocked only, ⬜ = not started; keep this table updated)

| Method | Path | Purpose | Status |
|---|---|---|---|
| GET | `/api/products` | list (`section`, `category`, `drop`, `color`, `size`, `sort`, `q`) | ⬜ |
| GET | `/api/products/:slug` | product detail + variants + stock | ⬜ |
| GET | `/api/drops/current` | current/next drop | ⬜ |
| POST | `/api/cart/validate` | re-price cart, check stock | ⬜ |
| POST | `/api/discounts/validate` | check a code | ⬜ |
| POST | `/api/checkout` | create order (COD) or Stripe session (CARD) | ⬜ |
| GET | `/api/orders/:number` | order confirmation (with token) | ⬜ |
| GET/POST/DELETE | `/api/wishlist` | customer wishlist | ⬜ |
| POST | `/api/webhooks/stripe` | payment confirmation | ⬜ |
| GET | `/api/admin/stats` | overview KPIs | ⬜ |
| GET | `/api/admin/orders` | list + filters | ⬜ |
| GET/PATCH | `/api/admin/orders/:id` | detail, change status (triggers notification) | ⬜ |
| GET/POST | `/api/admin/products` | list, create | ⬜ |
| GET/PATCH/DELETE | `/api/admin/products/:id` | edit, archive | ⬜ |
| PATCH | `/api/admin/variants/:id/stock` | set stock (logs a stock movement) | ⬜ |
| POST | `/api/admin/uploads` | signed image upload | ⬜ |
| GET/POST/PATCH | `/api/admin/drops` | manage drops | ⬜ |
| GET | `/api/admin/customers` | list | ⬜ |
| GET/POST/PATCH | `/api/admin/discounts` | manage codes | ⬜ |

---

## 6. Data model (backend owns `schema.prisma`; summary for both)

- **Product**: id, slug, name, description, section `WOMAN | MAN | UNISEX`, categoryId, dropId?, basePrice (minor units), currency, status `DRAFT | PUBLISHED | ARCHIVED`, images[], createdAt.
- **Variant**: id, productId, size (`XS…XXL`, or `ONE`), color (name + hex), sku, stock, priceOverride?.
- **Category**: id, slug, name. Starters: outerwear, tops, bottoms, accessories.
- **Drop**: id, number (01, 02…), name, releaseAt, status `UPCOMING | LIVE | ENDED`.
- **Customer**: id, email, name, phone, addresses[].
- **Order**: id, number (e.g. `VY-000123`), customerId?, guest email/phone, items[], subtotal, discount, shipping, total, currency, paymentMethod `COD | CARD`, paymentStatus `PENDING | PAID | REFUNDED`, status `NEW | CONFIRMED | SHIPPED | DELIVERED | CANCELLED | RETURNED`, statusHistory[], createdAt.
- **OrderItem**: variantId, name/size/colour snapshot, unitPrice, qty.
- **DiscountCode**: code, type `PERCENT | FIXED`, value, startsAt, endsAt, usageLimit, used.
- **StockMovement**: variantId, delta, reason `SALE | RESTOCK | ADJUSTMENT | RETURN`, by, at.
- **AdminUser**: id, username, passwordHash, role `OWNER | STAFF | DEMO`.

Launch catalogue (seed): about 16 products: wool coat, trench, overshirt, heavyweight hoodie, boxy tee, oxford shirt, fine-knit sweater, wide-leg trousers, straight denim, pleated trousers, cap, canvas tote, leather belt, beanie (+2). Colours: ivory, stone, grey, black, navy, plus one seasonal accent.

---

## 7. Auth and the public demo

- `/admin/*` is protected by middleware; unauthenticated users go to `/admin/login`.
- Roles:
  - **OWNER**: everything.
  - **STAFF**: orders, products and stock; no admin users, no settings.
  - **DEMO** (`test` / `test`):
    - Can do everything STAFF can, inside the demo data.
    - **Cannot:** delete anything permanently, change admin users, change settings, upload more than 5 images a day, or send real WhatsApp messages or emails (notifications are logged and shown as "would send").
- **Nightly reset:** a Vercel Cron job runs `prisma/seed.ts` to restore the demo data every night (UTC 03:00).
- Rate-limit `/admin/login` and all write endpoints.
- Never commit secrets. The demo password is public on purpose; the OWNER account is not.

---

## 8. Design system (frontend owns; backend just needs to know it exists)

- **Look:** quiet editorial minimalism (fashion magazine): lots of white space, big photos, small type.
- **Colours:** ivory `#F4F1EC`, stone `#D9D3C9`, ink `#111111`, grey `#6B665F`, accent burgundy `#6E1E2B` (used rarely).
- **Fonts:**
  - Bodoni Moda for headlines.
  - Geist for UI and body.
- **Buttons:** an underlined text link with an arrow, or a flat ink block. No rounded pills, gradients or emoji.
- **Photos:** generated with a consistent setup (backdrop matching the page colour, light from the left, no text or logos). The prompts are on the canvas.
- Accessibility: real buttons and links, 44px targets, 4.5:1 text contrast, keyboard navigation.

---

## 9. Git and GitHub workflow

- **Branches:** `main` is production (protected, deploys to Vercel). Work on `front/<thing>` or `back/<thing>` (e.g. `front/product-page`, `back/checkout-api`).
- **Commits:** Conventional Commits: `feat(shop): …`, `fix(api): …`, `chore: …`, `docs(claude): …`.
- **PRs:** small, one feature each, with a short description, a screenshot for UI changes, and any `CLAUDE.md` updates. The other person reviews contract changes; everything else can be merged by its owner after the checks pass.
- **Checks on every PR (GitHub Actions):** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Vercel posts a preview link.
- **`.github/CODEOWNERS`:**
  ```
  /src/app/            @sharaf-naai
  /src/components/     @sharaf-naai
  /prisma/             @Zidane-Nait-cheikh
  /src/server/         @Zidane-Nait-cheikh
  /src/app/api/        @Zidane-Nait-cheikh
  /src/contracts/      @sharaf-naai @Zidane-Nait-cheikh
  /CLAUDE.md           @sharaf-naai @Zidane-Nait-cheikh
  ```
- Pull `main` and rebase your branch at least daily to avoid big conflicts.

---

## 10. Environment variables

`.env.example` is committed with every key and **no values**. Real values: Vercel project settings + each person's local `.env.local`, shared through a password manager or a private message, **never in the repo or in chat screenshots**.

```
DATABASE_URL=
AUTH_SECRET=
STRIPE_SECRET_KEY=          # test mode key only
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CLOUDINARY_URL=
WHATSAPP_NUMBER=            # owner's number for wa.me links
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_USE_MOCKS=true  # frontend: true until the API exists
DEMO_RESET_CRON_SECRET=
```

---

## 11. Commands

```
pnpm dev            # run locally
pnpm lint / pnpm typecheck / pnpm test / pnpm build
pnpm db:migrate     # prisma migrate dev (backend; db:* scripts not added yet)
pnpm db:seed        # reset demo data (backend)
pnpm db:studio      # browse the DB
```

---

## 12. Decision log (add newest at the top)

| Date | Decision | Who |
|---|---|---|
| 2026-11-20 | English only: dropped FR/AR and next-intl; pages live directly under `src/app/` | Sharaf |
| 2026-11-20 | Admin lives at `/admin`; public demo login `test` / `test` with a DEMO role and a nightly reset | both |
| 2026-11-20 | One Next.js repo; frontend talks to backend only through `/api` + `src/contracts` | both |
| 2026-11-20 | Neutral minimal brand (no cultural references), working name VEYL | Sharaf |
| — | Chosen hero design: _[H1–H5, to decide]_ | |

## 13. Changelog (add newest at the top, one line per merged PR that matters)

| Date | Area | Change | PR |
|---|---|---|---|
| 2026-11-20 | chore | English only: removed next-intl, `messages/`, `src/i18n/`, `src/proxy.ts`; pages moved out of `[locale]` | — |
| 2026-11-20 | chore | Vercel project linked to GitHub (preview per PR, `main` = production); `NEXT_PUBLIC_USE_MOCKS=true` set | — |
| 2026-11-20 | chore | Next.js 16 app at repo root (Tailwind 4, design tokens), CI workflow, .env.example; `main` protected (PR + code-owner review + CI) | — |
| 2026-11-20 | chore | Added .gitattributes (LF) and .github/CODEOWNERS; filled in names | — |
| 2026-11-20 | docs | Project brief created | — |

---

## Notes for Claude Code
- Read §1 and §4 first: only edit files in the requester's area unless they explicitly ask otherwise.
- Never invent API shapes: use or extend `src/contracts`, and say in the PR description that both must approve.
- When you add or change an endpoint, a model, an env var or a convention, update the matching section here **and** add a line to §13.
- Keep everything labelled as a concept: no real brand names, no real payment keys, no real customer data.
