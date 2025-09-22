# Storageless

Example of storageless server for txr

## Prerequisites

- [Deno](https://deno.land/) installed
- [ngrok](https://ngrok.com/) installed and running (for local testing)
- Update storageless config in TXR Search API -

```
PUT https://txr-search.retailsvc.com/api/v1/config/storageless
// example testrunner config
{
  "clientId": "<client-id>",
  "clientSecret": "<client-secret>",
  "searchUrl": "https://9f0fd7e5aaea.ngrok-free.app/api/v1/transactions",
  "authUrl": "https://auth.retailsvc.com",
  "audience": "https://auth.retailsvc.com"
}
```

## Run

```bash
deno run --allow-net server.ts
```

## Test

```bash
curl --location 'https://txr-search.retailsvc.com/api/v1/transactions/regular-sales?includeLinkedTransactions=false&unzip=false' \
--header 'accept: application/json' \
--header 'Authorization: Bearer <token> \
--header 'Search-Backend: external'
```
