import { INPUT_API_URL, SEARCH_API_URL, TOKEN } from "./constants.ts";

export async function publishTransaction(
  payload: Uint8Array,
  headers: Record<string, string>,
) {
  const res = await fetch(
    INPUT_API_URL + "/transactions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Ignore-Domain-Check": "true",
        ...headers,
      },
      body: payload,
    },
  );

  if (res.status !== 202) {
    throw new Error(`Publishing failed: ${res.status} ${await res.text()}`);
  }
}

export async function getTransactionById(
  transactionId: string,
): Promise<{ transactionId: string; transactionData: string }> {
  const res = await fetch(
    SEARCH_API_URL + `/transactions/${transactionId}`,
    {
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Ignore-Domain-Check": "true",
      },
    },
  );

  if (res.status !== 200) {
    throw new Error(
      `Finding transaction failed: ${res.status} ${await res.text()}`,
    );
  }

  return res.json();
}

export async function searchTransactions(
  filter: Record<string, unknown>,
  page?: { skip: number; take: number },
): Promise<{
  results: { transactionId: string }[];
  page: {
    take: number;
    skip: number;
    total: number;
    hasMore: boolean;
  };
}> {
  const res = await fetch(
    SEARCH_API_URL +
      `/transactions:search?skip=${page?.skip || 0}&take=${page?.take || 100}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Ignore-Domain-Check": "true",
      },
      body: JSON.stringify(filter),
    },
  );

  if (res.status !== 200) {
    throw new Error(
      `Searching transactions failed: ${res.status} ${await res.text()}`,
    );
  }

  return res.json();
}
