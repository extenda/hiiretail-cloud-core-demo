import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { API_ENVIRONMENT } from "../lib/environment";
import { currentTenantId } from "../lib/token-claims";
import { BrandMark } from "./BrandMark";

const PILL =
  "rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100";

export function Header() {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const tenantId = currentTenantId();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4">
      <BrandMark />
      <span className="text-sm font-medium text-stone-900">
        Entity Conditions
      </span>
      <span className="hidden font-mono text-xs text-stone-400 sm:inline">
        {API_ENVIRONMENT}
      </span>

      <div className="flex-1" />

      <span
        title="Tenant claim on the OCMS token — every condition and decision is scoped to it"
        className="hidden max-w-64 truncate rounded-full bg-brand-50 px-2.5 py-1 font-mono text-xs text-brand-700 sm:inline"
      >
        tenant: {tenantId ?? "—"}
      </span>

      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600">Forget credentials?</span>
          <button
            onClick={logout}
            className="rounded-lg bg-red-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-800"
          >
            Yes
          </button>
          <button onClick={() => setConfirming(false)} className={PILL}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className={PILL}>
          Sign out
        </button>
      )}
    </header>
  );
}
