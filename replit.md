# PriceCheck NG

A Nigerian local price comparison web app where users can compare grocery, fuel, electronics, and household item prices across nearby Nigerian stores and vendors.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/pricecheck-ng run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + Framer Motion + Recharts + shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI spec
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit)
- `lib/api-zod/src/` — generated Zod schemas (do not edit)
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/pricecheck-ng/src/pages/` — React page components
- `artifacts/pricecheck-ng/src/components/` — Shared components (Navbar, VendorCard, PriceTrendChart)

## Architecture decisions

- Contract-first API: OpenAPI spec defined in `lib/api-spec`, codegen via Orval produces typed hooks and Zod validators
- PostgreSQL `numeric` columns must be cast to `::float8` in Drizzle SQL expressions — Drizzle returns them as strings otherwise, causing Zod validation failures
- Wouter used for routing instead of React Router — simpler and smaller bundle
- All price display in Nigerian Naira (₦) via `lib/format.ts` using `Intl.NumberFormat`
- ThemeProvider wraps the app supporting light/dark/system modes with localStorage persistence

## Product

- **Home page**: Hero search, category tabs, live price comparison for a featured product, 30-day price trend chart, price alert signup, trending products carousel
- **Search page**: Full-text product search, tabbed product switcher, sorted vendor prices, trend sidebar
- **Product detail**: Full vendor comparison table, price history chart, price summary stats, alert form
- **Deals page**: Grid of best prices today filtered by category
- **Categories page**: Browse or search all 15 products across 7 categories

## Seeded Data

- 7 categories (Food Items, Beverages, Phones, Electronics, Gas & Fuel, Beauty, Household)
- 15 products (rice, indomie, vegetable oil, sugar, coca-cola, petrol, cooking gas, iPhone 14, Samsung A14, LG TV, Dettol, Ariel, candles, bulbs, Milo)
- 10 Nigerian vendors (Shoprite, Jumia, Konga, AP Plaza, etc.)
- ~50 current price entries, 90 days of price history

## Gotchas

- Cast all Drizzle `sql<number>` expressions with `::float8` to avoid string type mismatches with Zod
- `pnpm --filter @workspace/api-spec run codegen` must be re-run after any OpenAPI spec changes
- Do not run `pnpm dev` at workspace root — use individual workflow commands
- API routes are prefixed `/api` and handled by the api-server artifact at port 8080

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
