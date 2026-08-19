import { Panel } from "../components/Panel";
import { TokenSlot } from "../auth/TokenSlot";
import { SLOT_IDS } from "../auth/storage";
import { API_ENVIRONMENT, API_HOST } from "../lib/environment";

const RULES = [
  {
    layer: "default",
    caller: "the module's own CI pipeline",
    note: "Never reachable from a browser: it is the pipeline's own identity that is accepted, not a permission.",
  },
  {
    layer: "managed",
    caller: "trs.translation.publish, on a token belonging to Extenda",
    note: "The global customer-facing copy. A customer-tenant token is denied here.",
  },
  {
    layer: "tenant",
    caller: "trs.translation.publish",
    note: "Writes under the tenant the token names — the request never carries a tenant id.",
  },
];

export function TokensPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">Tokens</h1>
        <p className="mt-1 text-sm text-stone-500">
          Reads are anonymous. A token only matters for publishing, and the layer
          it may publish follows from its tenant and permissions. This UI talks
          to <span className="font-mono">{API_HOST}</span>, so the token must be
          a <span className="font-mono">{API_ENVIRONMENT}</span> one.
        </p>
      </div>

      <div className="space-y-3">
        {SLOT_IDS.map((slot) => (
          <TokenSlot key={slot} slot={slot} />
        ))}
      </div>

      <Panel title="What each layer requires">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
                Layer
              </th>
              <th className="px-4 py-2 text-left text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
                Caller it accepts
              </th>
            </tr>
          </thead>
          <tbody>
            {RULES.map((rule) => (
              <tr key={rule.layer} className="border-b border-stone-50 align-top">
                <td className="px-4 py-2 font-mono text-xs text-stone-700">
                  {rule.layer}
                </td>
                <td className="px-4 py-2 text-stone-700">
                  {rule.caller}
                  <p className="mt-0.5 text-xs text-stone-500">{rule.note}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
