# Ingest Many Transactions

This scripts allows to ingest many test transactions for your tenant. Before starting the script make sure you:
 * uploaded `.xml` POSLog files to the transactions folder, 
 * updated the `token.jwt` file,
 * updated the `config.ts` file.

When started, the script will:
 1. take a transaction, and replace metadata according to the config,
 2. ingest a transaction,
 3. repeat.
