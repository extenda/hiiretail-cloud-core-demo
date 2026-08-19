# TRS Frontend

Demo UI for the **Translation Service (TRS)**, built with React, TypeScript, Vite,
Tailwind CSS, and React Query. Styling follows [`../DESIGN.md`](../DESIGN.md); the
scaffolding mirrors the CRS and CSS demos.

It is aimed at two audiences: frontend developers who will consume TRS, and the team that
owns it. So it favours showing the real rules over hiding them — the layer merge, the
per-key language fallback, the cache validators and the edge cases each get a visible
place.

## Screens

- **Read translations** – resolve a module + language tag through the anonymous read
  endpoint, browse the merged entries, filter them, and inspect the `ETag` /
  `Last-Modified` / `Cache-Control` the service returned. **Revalidate** repeats the request
  with `If-None-Match` to show the `304` path. Filling in the optional tenant id switches to
  `/tenants/{tenantId}/modules/…`, which merges the tenant layer on top.
- **Compare** (on the read screen) – the same read against `en-US`, or a tenant read against
  the base read. The first shows that untranslated keys are simply absent; the second shows
  exactly which keys a tenant overrides.
- **Published language tags** – `GET /modules/{moduleId}/language-tags`, listed as clickable
  chips. It covers the `default` and `managed` layers only, never a tenant's own languages,
  and answers `404` rather than an empty list.
- **Publish layer** – for `managed` and `tenant` this is a translator's view: the module's
  English source with its description and parameters on the left, the target language on the
  right, prefilled with what that layer already publishes. For `default` it is the module
  developer's view of the file — key, value, description, parameters.
- **How it resolves** – the layer table, what a read does, the consumer consequences, the
  edge cases with their status codes, and the caching rules.
- **Tokens** – paste the tokens you publish with, and see what each one is.

## Tokens

Reads are anonymous, so **Continue without a token** is enough to browse everything.
Publishing needs a token, and which layer a token may publish follows from its tenant and
permissions, not from its type:

| Layer | Caller it accepts |
|---|---|
| `default` | the module's own CI pipeline, authenticating as itself |
| `managed` | `trs.translation.publish`, on a token belonging to Extenda |
| `tenant` | `trs.translation.publish`; the tenant comes from the caller token |

So the UI keeps two slots: an **Extenda tenant token** for the `managed` layer and a
**customer tenant token** for that tenant's own overrides. Any staff JWT for the environment
works — copy the `Authorization` header your Operations Hub session sends — and a machine
client token is accepted the same way. `default` is out of reach from a browser whatever the
credentials.

Tokens are decoded locally to show their type, tenant, identity and expiry, and are kept in
`localStorage`. A token is issued per environment, so the screen also shows which
environment this UI proxies to.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

`vite.config.ts` proxies `/api` to **staging** (`translation.retailsvc.dev`), so a publish
from the demo does not touch production data. Swap the commented constant to point at
production for a read-only walkthrough of real values.

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – type-check and create a production build
- `npm run lint` – run ESLint
- `npm run preview` – serve the production build
- `npm run generate` – regenerate the typed API client from `openapi.json`

## Project layout

```
src/
  api/        generated client + read/publish wrappers
  auth/       token slots, JWT inspection, login gate
  components/ shell (header, sidebar) and UI building blocks
  hooks/      React Query data hooks + the translation draft
  lib/        entry/draft helpers, comparison, recent lookups
  pages/      read, publish, how-it-resolves, tokens
```

## API client

The typed SDK in `src/api/generated` is generated from `openapi.json` via
`@hey-api/openapi-ts`. After updating the spec, run `npm run generate`. The spec is served
publicly at `/schemas/v1/openapi.json` on the deployed service and checked into the service
repo under `schemas/v1/`.

`src/api/publish.ts` uses the generated SDK and passes the chosen token per request.
`src/api/read.ts` is a small hand-written fetch instead — one `read()` shared by the
translation reads and the language-tags list — because those screens need the raw `ETag` /
`Last-Modified` headers, have to treat `304` as a normal outcome rather than an error, and
must send no token at all.

## Notes

- The service has no "list modules" endpoint, so the module id is typed in. Recent lookups
  are remembered in `localStorage`. `demo` is published from the service repo itself and is
  the module to start from.
- There is no per-layer `GET`, so "what does this layer publish" is derived from reads: a
  tenant's own value is whatever its read shows that the base read does not.
- A publish replaces the whole file, so the translator view marks a key you clear as
  **will be removed** rather than pretending it is a per-key edit.
