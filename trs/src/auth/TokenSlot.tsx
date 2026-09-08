import { useState } from "react";
import { useAuth } from "./useAuth";
import { SLOT_META } from "./slots";
import type { SlotId } from "./storage";
import { expiryLabel, isExpired, type TokenInfo } from "./token-info";
import { API_ENVIRONMENT } from "../lib/environment";
import { ErrorBlock } from "../components/ErrorBlock";

const KINDS: Record<TokenInfo["kind"], string> = {
  user: "signed-in user",
  client: "machine client",
  unknown: "unrecognised issuer",
};

const BUTTON =
  "rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50";

function Summary({ info }: { info: TokenInfo }) {
  const wrongEnvironment =
    info.environment !== undefined && info.environment !== API_ENVIRONMENT;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
      <Field label="Type" value={KINDS[info.kind]} />
      <Field label="Tenant" value={info.tenantId ?? "—"} mono />
      <Field label="Identity" value={info.email ?? info.subject ?? "—"} mono />
      <Field
        label="Validity"
        value={expiryLabel(info)}
        tone={isExpired(info) ? "bad" : undefined}
      />
      <Field
        label="Issued for"
        value={info.environment ?? "unknown"}
        tone={wrongEnvironment ? "bad" : undefined}
      />
    </dl>
  );
}

function Field({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "bad";
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
        {label}
      </dt>
      <dd
        className={`truncate ${mono ? "font-mono" : ""} ${
          tone === "bad" ? "text-red-700" : "text-stone-700"
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

export function TokenSlot({ slot }: { slot: SlotId }) {
  const { slots, infos, setToken, clearToken } = useAuth();
  const { label, hint } = SLOT_META[slot];
  const info = infos[slot];
  const [draft, setDraft] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const held = slots[slot] !== undefined;
  const save = () => {
    setProblem(setToken(slot, draft));
    setDraft("");
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-900">{label}</p>
          <p className="mt-0.5 text-xs text-stone-500">{hint}</p>
        </div>
        {held && !editing && (
          <div className="flex shrink-0 gap-2">
            <button className={BUTTON} onClick={() => setEditing(true)}>
              Replace
            </button>
            <button className={BUTTON} onClick={() => clearToken(slot)}>
              Clear
            </button>
          </div>
        )}
      </div>

      {held && !editing && info && (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <Summary info={info} />
        </div>
      )}

      {(!held || editing) && (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Paste the token"
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={save}
              disabled={draft.trim() === ""}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use this token
            </button>
            {editing && (
              <button className={BUTTON} onClick={() => setEditing(false)}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {problem && (
        <div className="mt-3">
          <ErrorBlock title="That is not a usable token">{problem}</ErrorBlock>
        </div>
      )}
    </div>
  );
}
