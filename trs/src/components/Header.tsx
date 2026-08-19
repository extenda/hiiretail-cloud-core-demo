import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { SLOT_META } from "../auth/slots";
import { SLOT_IDS } from "../auth/storage";
import { isExpired } from "../auth/token-info";
import { API_ENVIRONMENT } from "../lib/environment";
import { BrandMark } from "./BrandMark";

const PILL =
  "rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100";

export function Header() {
  const { infos, reset } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const held = SLOT_IDS.filter((slot) => infos[slot] !== undefined);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4">
      <BrandMark />
      <span className="text-sm font-medium text-stone-900">
        Translation Service
      </span>
      <span className="hidden font-mono text-xs text-stone-400 sm:inline">
        {API_ENVIRONMENT}
      </span>

      <div className="flex-1" />

      {held.length === 0 ? (
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
          Read-only
        </span>
      ) : (
        held.map((slot) => {
          const info = infos[slot]!;
          const stale = isExpired(info);

          return (
            <span
              key={slot}
              title={`${SLOT_META[slot].label} — ${info.tenantId ?? "no tenant claim"}`}
              className={`hidden max-w-56 truncate rounded-full px-2.5 py-1 font-mono text-xs sm:inline ${
                stale
                  ? "bg-red-50 text-red-700"
                  : "bg-brand-50 text-brand-700"
              }`}
            >
              {slot}: {info.tenantId ?? "—"}
              {stale ? " (expired)" : ""}
            </span>
          );
        })
      )}

      <Link to="/tokens" className={PILL}>
        Tokens
      </Link>

      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-600">Forget tokens?</span>
          <button
            onClick={reset}
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
