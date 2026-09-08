# TRS Demo Plan

What to show, in what order, across the three apps in this repo. Everything points at
**production** (`translation.retailsvc.com`) by default — see each app's `vite.config.ts` to
swap to staging. The demo data (`demo-landing` / `demo-service` `en-US` default keysets, plus
`uk-UA` managed overrides) is already published on prod; nothing needs seeding first. See
[`keysets/README.md`](keysets/README.md) if it ever does.

## Setup

Three separate apps, three separate `npm install` + `npm run dev`:

| App | Path | Port | Role |
|---|---|---|---|
| Management app | `trs/` | 5173 | PM / tenant-admin tool |
| Demo Landing | `trs/apps/landing` | 5174 | consumer app, module `demo-landing` |
| Demo Service | `trs/apps/service` | 5175 | consumer app, module `demo-service` |

Have an Extenda-tenant token and (optionally) a customer-tenant token ready — paste on the
Tokens page. Reads never need a token; only publishing and Coverage do.

## Part 1 — Consumer apps (the payoff)

Start with `apps/landing`, then `apps/service`. This is what an actual tenant-facing app
consuming TRS looks like — no login, no admin surface, just i18n that works.

1. **Load `apps/landing` cold.** `en-US` renders immediately — `bootstrap.ts` fetches it first
   (blocking), initializes `i18next`, then fetches every other published language in parallel
   and caches each to `localStorage` as it arrives.
2. **Switch language in the dropdown.** Instant — no network round trip, because everything
   published was already downloaded at startup. Show Ukrainian rendering from the `uk-UA`
   managed override.
3. **Click "+1" on the visits counter.** Real ICU plural switching via `i18next-icu`, not a
   hand-rolled if/else: English flips `one` → `other`; Ukrainian (four CLDR categories) shows
   more of the plural space.
4. **Click "Simulate TRS offline", reload.** Every fetch on the next startup skips the network
   and goes straight to the `localStorage` cache — an **offline — from cache** badge appears.
   Toggle it back to prove it's a deliberate demo switch, not an actual outage.
5. **Click through to `apps/service`.** Same bootstrap/cache/offline story, plus `{name}`
   interpolation (the name field) and +/− buttons instead of a single counter.
6. **Append `?tenant=<id>` to the landing URL.** Every read switches to
   `/tenants/{tenantId}/modules/demo-landing/...`, merging that tenant's own overrides on top
   — still anonymous, no auth. The tenant id carries across the link into `apps/service` too.
   (No tenant override is published yet for either module — publish one live in Part 2 to make
   this land, or seed one beforehand via `keysets/README.md`.)

## Part 2 — Management app

Now show who produces what Part 1 consumed. The flow here is a straight line: **Apps → a
module's Translations screen** — no separate read / compare / coverage screens to hop between,
it's all one page per module.

1. **Apps (home).** Cards for both modules with their published language tags — no auth. A
   language chip gets a small amber dot when it's incomplete *and* an Extenda token is held —
   worth pointing out even before clicking in. **Translate** goes straight into that module's
   Translations screen.
2. **The Stats dropdown.** Click it open: every language tag shows its coverage (`6/7`, `3
   missing`) when an Extenda token is held, or "not started" before it is. This *is* the old
   Coverage screen's per-language view — picking where to work and seeing what's incomplete are
   now the same click.
3. **Read, anonymous.** Before pasting any token, the table already shows English next to the
   current language's published value, plain text (not inputs) since there's nothing to save
   yet, with a "Read-only — sign in to translate" note. Missing keys are already marked.
4. **Translate — write side.** Paste an Extenda token on Tokens, come back — the panel now
   shows real inputs, targeting `managed` automatically (no layer picker; `layerForSlot`
   derives it from which token you hold). Edit a string, **Save**, watch the coverage numbers
   in the Stats dropdown and the row's **missing** badge clear immediately. Flip to
   `apps/landing` and reload to show the change propagate end-to-end. If you also hold a
   customer-tenant token, a toggle appears between "Global copy" and "This tenant" — publish a
   `tenant`-layer override and go back to `apps/landing?tenant=<id>` to close the loop from
   Part 1, step 6.
   - **Upload JSON…** — instead of typing each field, click **Upload JSON…** and pick
     `keysets/demo-landing/uk-UA.managed.json` straight off disk: it fills every row in one shot
     (value + plural forms) and reports how many keys matched, no retyping the whole Ukrainian
     batch live. Review the filled form, then **Save** as normal — the upload only fills the
     draft, it never publishes by itself. Good beat to land right before the "close the loop"
     step above, since it turns "watch me type 7 fields" into "watch the whole form fill
     instantly."
5. **Override English itself.** Open the Stats dropdown and pick **American English** — it's a
   selectable target now, not just the fixed left-hand reference column. The table pre-fills
   every row from the current resolved English text (translated, not missing — this is an
   override, not a translation), and the right column header reads **American English
   override** as a reminder of what publishing there actually changes. Edit one string, **Save**
   — same `managed`/`tenant` toggle, same mechanism, just targeting `en-US`. Good "wait, you can
   do that?" beat.
6. **Row markers.** While translating the global copy (never a tenant override — coverage
   never reflects one, by design), point out **out of date**, **unused parameter**, **missing
   plural forms** appearing inline on the affected rows, sourced from the same per-key coverage
   endpoint the old Coverage screen used — now read in place instead of on a separate page.
7. **What a layer can't change.** Type an extra `{foo}` into a value that doesn't already use
   it, and Save disables with "Fix these before saving — `key` uses `{foo}`, which this key
   does not allow." This isn't a client nicety invented for the demo: the API's own publish
   description says a `managed`/`tenant` file "carries the translated value alone — the
   description and the parameters stay as the `default` layer declared them," so `parameters`
   (and `plural.parameter`, the counting variable name) can only ever be set by the module's own
   `default` file — a managed or tenant publish cannot introduce a new parameter, no matter what
   you send. Good answer to have ready if someone asks "can a PM add a parameter?"
8. **Revalidate.** The collapsed `ETag "…" · Revalidate` line at the bottom of the table repeats
   the request with `If-None-Match` to show the `304` path — same technical beat as before, just
   tucked out of the way instead of its own panel.
9. **Tokens.** Show both slots (Extenda / customer tenant) side by side, and that pasting a
   token locally decodes its type, tenant, identity, and expiry — nothing round-trips to a
   server to inspect it.

## Part 3 — Where the `default` layer actually comes from (optional, if there's time)

The management app deliberately has **no** authoring UI for the `default` layer — worth
calling out explicitly, since it's the one gap a PM might expect to see.

- `keysets/demo-landing/en-US.json` / `keysets/demo-service/en-US.json` are byte-identical to
  `hiiretail-translation-service/translations/demo-landing/en-US.json` and
  `.../demo-service/en-US.json` — the real source of truth.
- That service repo's `.github/workflows/translations-demo.yml` runs the shared
  `extenda/actions/translations@v0` action on every push to those paths, authenticating with a
  GCP service-account/WIF identity, and publishes to both staging and prod.
- If you want to show it live: edit a value in the service repo's
  `translations/demo-landing/en-US.json`, push, watch the Action run, then reload `apps/landing`
  and show the new copy — no redeploy of any frontend needed.

## Known gaps / talking points

- The Stats dropdown's default selection is the alphabetically-first **published** non-English
  tag, not necessarily Ukrainian — `demo-landing` now also has `sv-SE` published (picked up
  live on prod during this work, not something this repo did), and `sv-SE` sorts before
  `uk-UA`. If the demo depends on Ukrainian being the one on screen when the page loads, select
  it explicitly from the dropdown rather than assuming the default lands there.
- No tenant-layer override is published yet for either module going into a fresh demo — either
  publish one live in Part 2, step 3, or pre-seed one via `keysets/README.md`'s curl recipe if
  you'd rather not depend on a live edit going smoothly on stage.
- The working tree has this whole Apps/Translations-merge, multi-app restructure sitting
  uncommitted — fine for demoing, but commit before it's easy to lose track of what's new (not
  done here per standing "no git ops unless asked" instruction).
- Coverage / plurals / the `format=raw` every read depends on come from `HII-13642`, which may
  not have reached every environment — stick to prod for the demo, it's confirmed live there.
