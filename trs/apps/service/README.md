# Demo Service

A public consumer app for the **Translation Service (TRS)** module `demo-service`. Not part
of the management app (`../..`) — a separate, standalone React project. Linked from
[Demo Landing](../landing) — the module `demo-landing` — to show the two consumer apps
connected while still running (and deploying) separately.

## What it demos

- **Downloads the default keyset, then every other published language, on startup.**
  `src/bootstrap.ts` fetches `en-US` first (blocking — it is the fallback every other
  language needs), initializes `i18next` with it, then fetches the rest of
  `GET /modules/demo-service/language-tags` in parallel. Every language that resolves is
  stored in `localStorage` (`src/storage.ts`) as it arrives — not lazily, on first use.
- **A language dropdown** that calls `i18next.changeLanguage`, instant because the language
  was already downloaded and stored at startup — no per-switch network round trip.
- **A standard i18n library**: `i18next` + `react-i18next`, with the `i18next-icu` formatter
  so the service's compiled `format=icu` strings (plain values and, for `service.jobs.count`,
  a full ICU `plural` MessageFormat string) render through the real ICU pluralization rules
  rather than a hand-rolled one. Use the +/− buttons to watch the plural form switch as the
  count changes, and the name field to see `{name}` interpolation live.
- **Runs from a tenant's scope.** `?tenant=<id>` in the URL (as forwarded by the link from
  Demo Landing) switches every read to `/tenants/{tenantId}/modules/demo-service/...`,
  merging that tenant's own `tenant`-layer overrides on top — same anonymous endpoint, no
  auth.
- **Falls back to cache when TRS isn't reachable.** Every startup always tries the network
  first — the default keyset, the published-languages list, and each language's entries are
  each fetched fresh. Only on failure does that one thing fall back to whatever
  `localStorage` cached from the last startup that *did* reach TRS; nothing is ever served
  stale-by-choice. An **offline — from cache** badge in the header shows whenever anything
  had to take that fallback. Click **Simulate TRS offline** to force every fetch on the next
  startup to skip the network and go straight to cache — a way to demo the fallback without
  actually taking the service down. It's a toggle (persisted in `localStorage`, reloads the
  page to apply): click it again to go back to live.

## Run locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5175` (fixed in `vite.config.ts`, so the "back to landing" link —
which expects `http://localhost:5174` — resolves without any extra config). `/api` proxies to
production (`translation.retailsvc.com`); swap the constant in `vite.config.ts` for staging if
the two apps' keysets were only seeded there.

Nothing renders beyond `en-US`'s flat fallback values until `../../keysets/demo-service/en-US.json`
has actually been published to the `default` layer — see
[`../../keysets/README.md`](../../keysets/README.md).

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – type-check and create a production build
- `npm run lint` – run ESLint
- `npm run preview` – serve the production build

## Project layout

```
src/
  api.ts        fetch wrappers: language-tags, format=icu translations
  storage.ts    localStorage cache — every downloaded language, keyed by tag
  tenant.ts     ?tenant= query param in, carried through the link back to the landing app
  bootstrap.ts  the startup sequence: default keyset -> i18next init -> the rest, in parallel
  App.tsx       header (brand, tenant badge, language select) + the demoed strings
  main.tsx      awaits bootstrap() before the first render
```
