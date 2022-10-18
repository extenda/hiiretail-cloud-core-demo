import { BigQuery } from "@google-cloud/bigquery";
import fetch from 'node-fetch';

export async function createTxFetcher(tenantName = "testrunner") {
  const tenantId = await getTenantId(tenantName);
  const bq = new BigQuery({ projectId: "cloud-core-prod-2d76" });
  const dataset = bq.dataset(`${tenantId}_dataset`);  
  const txs = dataset.table("transactions_table");

  return async (txId) => {
    const [results] = await txs.query(`
      SELECT *
      FROM ${txs.id}
      WHERE transactionId = '${txId}';
    `);
    
    return results[0];
  }
}

async function getTenantId(tenant, isStaging = false) {
  const env = isStaging ? "dev" : "com";
  const result = await fetch(
    `https://iam-api.retailsvc.${env}/api/v1/login-config?tenantAlias=` +
      tenant,
  );

  const body = await result.json();
  return body.tenantId;
}
