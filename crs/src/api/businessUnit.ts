import { getValidAccessToken } from "../auth/token";

const BASE = "/bum-api";

export interface GroupDto {
  id: string;
  name: string | null;
  parentGroupId: string | null;
  groupTypes: string[];
  fullPath: string;
  children?: GroupDto[];
}

export interface BusinessUnitResponse {
  id: string;
  name: string;
  status: "Created" | "Active" | "Closed" | "Deleted";
  groups: string[];
  type: "PHYSICAL_STORE" | "WAREHOUSE";
}

async function bumFetch<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const token = await getValidAccessToken();
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`BUM API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export function fetchGroups(): Promise<GroupDto[]> {
  return bumFetch<GroupDto[]>("/groups");
}

export function fetchBusinessUnits(
  groups?: string[],
): Promise<BusinessUnitResponse[]> {
  const params: Record<string, string> = {};
  if (groups?.length) {
    params.groups = groups.join(",");
  }
  return bumFetch<BusinessUnitResponse[]>("/business-units", params);
}
