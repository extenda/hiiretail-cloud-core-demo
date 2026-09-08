import { TokenSlot } from "../auth/TokenSlot";
import { SLOT_IDS } from "../auth/storage";
import { API_ENVIRONMENT } from "../lib/environment";

export function TokensPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">Tokens</h1>
        <p className="mt-1 text-sm text-stone-500">
          Used when you save. Must match this environment ({API_ENVIRONMENT}).
        </p>
      </div>

      <div className="space-y-3">
        {SLOT_IDS.map((slot) => (
          <TokenSlot key={slot} slot={slot} />
        ))}
      </div>
    </div>
  );
}
