# TRS Frontend

Demo UI for the **Translation Service (TRS)**, built with React, TypeScript, Vite,
Tailwind CSS, and React Query. Styling follows [`../DESIGN.md`](../DESIGN.md); the
scaffolding mirrors the CRS and CSS demos.

It is scoped to the people who actually update copy through it: the **PM** (the `managed`
layer — the global, customer-facing text) and a **tenant admin** (the `tenant` layer — that
tenant's own overrides). The `default` layer — the module's declared key set, authored in the
module repo and published by its own CI pipeline — shows up as read-only context wherever a
translator needs to see the English source, but there is no authoring UI for it here: that is
the module developer's job, in their own repo, not a PM's or a tenant admin's.

This is the **management app**. The two consumer apps that actually read from it —
[`apps/landing`](apps/landing) and [`apps/service`](apps/service) — are separate React
projects that only ever hit the anonymous read endpoints; this app is where their `default`
keysets get seeded and their `managed`/`tenant` overrides get authored and inspected.

Everything here is scoped to the two modules this demo ships, `demo-landing` and
`demo-service` — there is no free-text module id anywhere, since the service has no
list-modules endpoint and a PM only ever works on the modules they own.

## Screens

The flow is a straight line: **Apps → a module's Translations screen**, and everything about
that module — which language, how complete it is, what's missing, editing it — lives on that
one screen instead of being split across separate read / compare / coverage screens.

- **Apps** (home) – cards for `demo-landing` and `demo-service` with their published language
  tags. A language chip gets a small amber dot when an Extenda token is held and that
  language isn't fully covered yet, so incompleteness is visible before you even click in.
  **Translate** goes straight to that module's Translations screen — there's no module picker
  to re-visit once you've clicked a card.
- **Translations** (`/translations/:moduleId`) – the one screen for a module. Across the top:
  - A **Stats dropdown** in place of a plain language `<select>` — each option shows the
    language plus its coverage (`6/7`, `3 missing`) pulled from `GET /modules/{id}/coverage`
    when an Extenda token is held, or "not started" when it isn't published yet. Choosing a
    language is the same click as seeing what's incomplete in it. `en-US` is a selectable
    target too, not just the fixed left-hand reference column: the default layer's own English
    declarations are read-only, but a PM or tenant admin can still override that text at their
    own layer without waiting on the module's own repo/pipeline — the column header reads
    "American English **override**" as a reminder of what publishing there actually changes.
  - A **Global / My customer** toggle when both an Extenda and a customer token are held (just
    a label when only one is); which layer a token opens follows from `layerForSlot`
    (`src/auth/slots.ts`), never from a separate picker.
  - A **Translate {module} · {language}[· {tenant}]** panel below: one row per declared
    English key, English + description + parameters + a `plural` tag on the left, the
    editable target-language value + plural editor on the right. Rows carry inline status
    markers — **missing** (no value yet, only shown while translating the global copy — a
    tenant row with no override just inherits it, which the "Using the global text" note
    already says), **out of date**, **unused parameter**, **missing plural forms** — sourced
    from `GET /modules/{id}/coverage/{langTag}`, the same endpoint that used to live on its
    own Coverage screen. A key you clear is marked **will be removed** rather than pretending
    it's a per-key edit, since a publish replaces the whole file.
  - **Upload JSON…** fills the whole form in one go from a file instead of typing each field —
    a flat `{ key: { value, plural?: { forms } } }` map (or a wrapped `entries` file, or a
    plain `{ key: "value" }` map), matched against this module's declared keys; the same shape
    the `keysets/*/uk-UA.managed.json` files already use, so those work as upload fixtures
    as-is (see [`keysets/README.md`](keysets/README.md)). It only fills the draft — review and
    **Save** still publishes it.
  - Without a token, the same screen still renders — read-only, plain text instead of inputs,
    no Upload/Save controls, with a "Read-only — sign in to translate" note — because reads
    are anonymous and browsing shouldn't need a token even though editing does.
  - A collapsed `ETag "…" · Revalidate` line at the bottom re-requests with `If-None-Match` to
    show the `304` path, without competing with the table for attention.
- **Tokens** – paste the tokens you update translations with, and see what each one is.

## Tokens

Reads are anonymous, so **Continue without a token** on the login screen is enough to browse
everything. Updating a translation needs a token, and which layer a token may publish follows
from its tenant and permissions, not from its type:

| Layer / call | Caller it accepts |
|---|---|
| `default` publish | the module's own CI pipeline, authenticating as itself |
| `managed` publish | `trs.translation.publish`, on a token belonging to Extenda |
| `tenant` publish | `trs.translation.publish`; the tenant comes from the caller token |
| coverage (both endpoints) | `trs.stats.read`, on a token belonging to Extenda |

So the UI keeps two slots — an **Extenda tenant token** for the `managed` layer and coverage,
and a **customer tenant token** for that tenant's own overrides — and the **login screen shows
both at once**, so a PM and a tenant admin can each paste their token in the same session
before continuing; pasting one no longer dismisses the form out from under the other. The
Translations screen then uses whichever token(s) you brought: one held token picks its layer
automatically, both held tokens add the toggle. Any staff JWT for the environment works — copy
the `Authorization` header your Operations Hub session sends — and a machine client token is
accepted the same way. `default` is out of reach from a browser whatever the credentials, and
coverage is denied to a customer-tenant token even when it does hold `trs.stats.read` — the
guard is the caller's own tenant, not the permission.

Tokens are decoded locally to show their type, tenant, identity and expiry, and are kept in
`localStorage`. A token is issued per environment, so the screen also shows which
environment this UI proxies to. The Tokens page (separate from the login screen) is where you
add, replace or clear a token later in the session without a full-page interruption.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

`vite.config.ts` currently proxies `/api` to **production** (`translation.retailsvc.com`) for
the demo — publishing here writes real data. Swap to the commented staging constant
(`translation.retailsvc.dev`) for throwaway publish testing, and note that Coverage / plurals
/ the `format=raw` every read depends on are from `HII-13642`, which may not have reached
every environment yet.

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – type-check and create a production build
- `npm run lint` – run ESLint
- `npm run preview` – serve the production build
- `npm run generate` – regenerate the typed API client from `openapi.json`

## Project layout

```
src/
  api/        generated client + read/publish/coverage wrappers
  auth/       token slots (both shown at login), JWT inspection, login gate
  components/ shell (header, sidebar), the Stats dropdown, the translate table, UI building blocks
  hooks/      React Query data hooks, the translation draft, the shared selected-module hook
  lib/        the two-app list, entry/filter helpers, plural categories
  pages/      apps, translations (per module: read + edit + coverage markers, merged), tokens
```

## API client

The typed SDK in `src/api/generated` is generated from `openapi.json` via
`@hey-api/openapi-ts`. After updating the spec, run `npm run generate`. The spec is served
publicly at `/schemas/v1/openapi.json` on the deployed service and checked into the service
repo under `schemas/v1/`.

`src/api/publish.ts` and `src/api/coverage.ts` both use the generated SDK and pass the
Extenda-slot token per request. `src/api/read.ts` is a small hand-written fetch instead — one
`read()` shared by the translation reads and the language-tags list — because those screens
need the raw `ETag` / `Last-Modified` headers, have to treat `304` as a normal outcome rather
than an error, and must send no token at all. It always requests `format=raw` — this app has
no use for the compiled `format=icu` representation, since it only ever shows a human the
underlying entry, never feeds it to an i18n runtime.

## Keysets

[`keysets/`](keysets) holds the `en-US` `default`-layer files for `demo-landing` and
`demo-service` — small, hand-written, ready to seed with whatever pipeline credential
actually holds `default`-layer access (see [`keysets/README.md`](keysets/README.md)). Until
one of them is published, the Apps screen's card for that module will show "nothing published
yet."

## Notes

- Every module-scoped screen picks its module from the route (`/translations/:moduleId`), set
  by clicking a card on Apps — there is no free-text module id anywhere, and no in-page module
  picker to re-visit, since the service has no list-modules endpoint and this app only ever
  manages the two modules it ships. `useSelectedApp` persists the choice in `localStorage` so
  the sidebar's Translations link and a plain `/translations` visit land on the same module you
  were last looking at.
- The Translations screen never offers a layer or token picker: `layerForSlot`
  (`src/auth/slots.ts`) maps the Extenda slot to `managed` and the tenant slot to `tenant`,
  and the screen just uses whichever layer(s) the session's held tokens open. This is
  deliberate — an arbitrary layer/token combination could quietly try to publish `managed`
  with a tenant token and let the 403 explain it after the fact instead of before.
- There is no per-layer `GET`, so "what does this layer publish" is derived from reads: a
  tenant's own value is whatever its read shows that the base read does not. The same
  derivation applies to plural forms.
- Coverage's per-key issues (stale, unused parameters, missing plural forms) only ever
  annotate rows while translating the **global** copy — coverage is a `default` + `managed`
  read only and never reflects a tenant's own override, so showing it while editing one would
  misrepresent what that row means. Coverage's "orphan" signal (a published key the default
  layer no longer declares) has no row to attach to on this screen on purpose: this table only
  lists declared keys, and a key isn't in a Save's outgoing entries unless it has a row here,
  so an orphan can't be edited or saved from this screen without misrepresenting what Save
  would actually do to it.
- Plural categories shown in the editor come from the browser's own
  `Intl.PluralRules(langTag).resolvedOptions().pluralCategories` — the same CLDR data the
  service itself compiles ICU against — rather than a hardcoded table.
