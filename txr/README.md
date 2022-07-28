# Transaction repository flow demo

Features:

- publishing transactions to input api
- receiving external events with transactions
- receiving external events with sequence gaps
- finding transaction by id
- finding transaction using search

## Usage

Create a file called `token.jwt` and paste your token there.

Use the following commands:
```bash
deno task listen      # listen for external events (transactions + gaps)
deno task publish     # publish transaction
deno task find-by-id   # find transaction by id
deno task search      # find transactions by business-unit-id
deno task ingest-many # ingest many transactions
```

## Prerequisites

This demo uses [Deno runtime](https://deno.land/).

You can setup a working environment using [GitPod](https://www.gitpod.io/).
