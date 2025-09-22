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
  "clientId": "YnVzaW5lc3NfdW5pdF9pZDogIjAwMSIKaXNvX2NjOiBoZS1IRQpzZnc6IHN0Z0B2MUBDSVI3blF3dFMwckE2dDBTNmVqZAp0aWQ6IENJUjduUXd0UzByQTZ0MFM2ZWpkCndvcmtzdGF0aW9uX2lkOiAiMDAyMyIK",
  "clientSecret": "8b0580e190c050a43dc4cd20d87d142640b0d9430ac361d29779b8c6aebc396b",
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
