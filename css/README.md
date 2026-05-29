# CSS Frontend

Composable Survey Service (CSS) frontend built with React, TypeScript, and Vite.

This is an **auth-only bootstrap**: it authenticates with OCMS client credentials and
shows a placeholder shell. Survey features will be layered on top later. The structure,
auth flow, and styling mirror the CRS demo (see `../crs`).

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the URL printed by Vite (usually `http://localhost:5173`).
4. Enter your OCMS `Client ID` and `Client Secret` in the login form.

Authentication uses the OCMS client-credentials grant against the shared auth service
(`https://auth.retailsvc.com`) via the dev proxy. The token is cached in `localStorage`.

## Useful scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and create production build
- `npm run lint` - run ESLint
- `npm run preview` - serve the production build locally

## Notes / TODO before adding features

- Confirm the real survey-service API host and prefix, then update the `/api` proxy
  target in `vite.config.ts` (currently a placeholder `https://css-api.retailsvc.com`).
- Add the typed API client (e.g. via `@hey-api/openapi-ts`) once the OpenAPI spec is
  available, following the CRS `api/` pattern.
