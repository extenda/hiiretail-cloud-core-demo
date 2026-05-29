# CSS Frontend

Demo UI for the **Composable Survey Service (CSS)**, built with React, TypeScript, Vite,
Tailwind CSS, and React Query. Structure, auth flow, and styling mirror the CRS demo
(see `../crs`).

## Features

- **Surveys** – list with status filter, create (dynamic question builder), and a
  read-only detail view.
- **Fill the survey** – pick a business unit + product, then answer a running survey;
  each answer autosaves to a response.
- **Responses** – per-survey list of responses; open one to view (terminal responses) or
  keep editing it (in-progress responses).

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`) and sign in with your OCMS
`Client ID` and `Client Secret`. Auth uses the OCMS client-credentials grant via the dev
proxy; the token is cached in `localStorage`.

## Scripts

- `npm run dev` – start the local dev server
- `npm run build` – type-check and create a production build
- `npm run lint` – run ESLint
- `npm run preview` – serve the production build
- `npm run generate` – regenerate the typed API client from `openapi.json`

## Project layout

```
src/
  api/        generated client + thin re-export wrapper (client.ts)
  auth/       OCMS client-credentials flow + login gate
  components/ UI building blocks (forms, tables, modals, fill runner)
  hooks/      React Query data hooks
  lib/        formatting + survey/response helpers
  pages/      route screens (surveys, fill, responses)
```

## API client

The typed SDK in `src/api/generated` is generated from `openapi.json` via
`@hey-api/openapi-ts`. After updating the spec, run `npm run generate`. Backend host and
prefix are configured by the `/api` and `/oauth2` proxies in `vite.config.ts`.
