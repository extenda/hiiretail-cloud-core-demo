# TXR Reindexer Monitor

A Vite + React + Tailwind CSS dashboard that monitors the **TXR Elastic Reindexer** Cloud Run Job and correlates its executions with progress records in Spanner.

## What it shows

- All Cloud Run Job executions for `txr-transaction-elastic-reindexer` in `cloud-core-prod-2d76 / europe-west1`
- Matched Spanner `reindex_job_progress` rows (matched by `BACKING_INDEX_ID` env var → `backing_index` column)
- Per-job: CRJ status, Spanner status, documents processed, start/update times, error details
- Unmatched entries (executions without a Spanner record, or Spanner records older than the API's 50-execution window)
- Auto-refreshes every 30 seconds

## Prerequisites

1. [gcloud CLI](https://cloud.google.com/sdk/gcloud) installed
2. Application Default Credentials set up:

   ```bash
   gcloud auth application-default login
   ```

3. Your account must have the following IAM roles in `cloud-core-prod-2d76`:
   - `roles/run.viewer` (Cloud Run executions)
   - `roles/spanner.databaseReader` (Spanner `reindex_job_progress`)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## How matching works

Each Cloud Run Job execution that was triggered with a `BACKING_INDEX_ID` env-var override carries that value in its execution metadata. The app reads it via the Cloud Run v2 API and pairs it with the Spanner row whose `backing_index` column matches. When the same index was reindexed more than once, the closest `createTime` ↔ `started_at` pair is chosen.
