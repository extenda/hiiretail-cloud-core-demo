# Transaction repository flow demo

Features:

- publishing transactions to input api
- receiving external events with transactions
- receiving external events with sequence gaps
- finding transaction by id
- finding transaction using search

## Usage

To listen for external events:

```bash
deno task listen
```

To publish transactions:

```bash
deno task publish
```

## Prerequisites

This demo uses [Deno runtime](https://deno.land/).
