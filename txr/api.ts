export async function publishTransaction(
  payload: Uint8Array,
  headers: Record<string, string>,
) {
  const res = await fetch(
    "https://txr-input.retailsvc.dev/api/v1/transactions",
    {
      method: "POST",
      headers: headers,
      body: payload,
    },
  );

  if (res.status !== 202) {
    throw new Error(`Publishing failed with code: ${res.status}`);
  }
}
