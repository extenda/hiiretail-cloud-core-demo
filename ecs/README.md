# ECS Frontend

Demo UI for the **Entity Conditions Service (ECS)** — a stand-in checkout that asks ECS
for a decision on every basket line, plus the screens for the condition catalog behind it.
React 19 + Vite + Tailwind v4 + React Query, with a typed client generated from the
service's published OpenAPI spec. Local only; never deployed.

## What it demos

- **Checkout** — add items to a basket, answer what a POS operator would answer (customer
  age, the licenses the customer holds), and evaluate. Each line is decided per condition
  (`POST /conditions/{id}/evaluate`), the results are aggregated into one basket decision,
  and a `SOFT_DENY` for missing context turns into the prompt the operator would get
  ("ask the customer's age") instead of a dead end. Every line shows the raw request and
  response. Set a CRS project id and each line is also checked against that project's live
  restrictions.
- **Condition catalog** — every global condition plus the ones this tenant owns
  (`GET /entity-conditions`), filterable by scope, rule and id. Create, edit and delete
  tenant conditions (`PUT`/`DELETE /entity-conditions/{id}`); global ids are read-only and
  answer 409.
- **Project restrictions** — a playground for `POST /project-restrictions/evaluate`: one
  item, one project, editable `additionalProperties`, so you can watch BOOLEAN, WHITELIST
  and BLACKLISTEDITEMS restrictions flip the decision.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) and sign in with your OCMS
`Client ID` and `Client Secret`. The client-credentials grant goes through the dev proxy
and the token is cached in `localStorage`. The tenant is taken from the token — it is never
a parameter, so what you see is the catalog of whichever tenant the credentials belong to.

The client needs `ecs.condition.read`, `ecs.condition.write`, `ecs.condition.delete`,
`ecs.condition.evaluate` and `ecs.project-restriction.evaluate`. A `403` is a credentials
problem, not a UI bug — the screens surface it as-is.

`vite.config.ts` proxies to the prod host by default; the commented-out line switches both
the API and the auth service to test.

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – type-check and build
- `npm run lint` – run ESLint
- `npm run preview` – serve the production build
- `npm run generate` – regenerate the typed client from `openapi.json`

## Project layout

```
src/
  api/        generated client + client.ts (base url, auth, named re-exports)
  auth/       OCMS client-credentials flow + login gate
  components/ shell and building blocks (panels, badges, tables, modals)
  hooks/      React Query hooks: catalog read, checkout fan-out, restriction call
  lib/        demo catalog, checkout model, decision/reason wording, UI class recipes
  pages/      Checkout, Condition catalog, Project restrictions
```

## Notes

- The product catalog in `src/lib/catalog.ts` is fake — no service owns it. Each product
  declares the condition ids the checkout claims for it, and any id the tenant does not
  have is flagged on the line, because evaluating it answers 404.
- Both evaluate endpoints ship with `operationId: evaluate`, so the generator names them
  `evaluate` and `evaluate2`. `src/api/client.ts` renames them and fails the build if a
  regeneration ever swaps the two.
- A decision with an empty `results` array is shown as *not evaluated* rather than allowed:
  the condition resolved, but the evaluation bundle had not picked it up yet.
