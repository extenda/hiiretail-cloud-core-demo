# CRS Frontend

Customer Registry Service (CRS) frontend built with React, TypeScript, and Vite.
The app lets you:

- search customers (unified `query` across name and external id, plus field filters)
- view and edit a customer, including customer type, order number and loyalty
- create a customer through the tenant proxy (`POST /customers:create`, 200 stored or 202 accepted)
- manage related projects (with ADID) and trusted agents (with contact details)
- try the external-ingest endpoints live

The header has a **What's new** menu listing the latest API changes. New fields and filters
carry a small `new` marker in the UI; toggle "Highlight in UI" in that menu to hide them.

Authentication is done with OCMS client credentials from inside the app.

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
   If you need test credentials, use the template link in the UI:
   [Create OCMS client](https://testrunner.hiiretail.com/ocms/templates/local/crs/1?tab=clients).

## Useful scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and create production build
- `npm run lint` - run ESLint
- `npm run preview` - serve the production build locally
- `npm run generate` - regenerate API client from `openapi.json`
