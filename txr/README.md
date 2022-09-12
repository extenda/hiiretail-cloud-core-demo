# Transaction repository flow demo

Features:

- publishing transactions to input api
- receiving external events with transactions
- receiving external events with sequence gaps
- finding transaction by id
- finding transaction using search
- validating transactions using xsd

## Usage

Create a file called `token.jwt` and paste your token there.

Use the following commands:
```bash
deno task listen              # listen for external events (transactions + gaps)
deno task publish             # publish transaction
deno task find-by-id           # find transaction by id
deno task search              # find transactions by business-unit-id
deno task ingest-many         # ingest many transactions
deno task search-and-download # searches transactions and saves them as xmls to a directory
```

If you have `xmllint` installed, you can also validate the transactions in the directory by using the `validate-transactions.sh`
script. It saves output of validation to a `.txt` file.

## Prerequisites

This demo uses [Deno runtime](https://deno.land/).

You can setup a working environment using [GitPod](https://www.gitpod.io/).
