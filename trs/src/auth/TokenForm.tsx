import { useAuth } from "./useAuth";
import { TokenSlot } from "./TokenSlot";
import { SLOT_IDS } from "./storage";
import { BrandMark } from "../components/BrandMark";
import { API_ENVIRONMENT, API_HOST } from "../lib/environment";

export function TokenForm() {
  const { slots, continueAnonymously, enter } = useAuth();
  const held = SLOT_IDS.filter((slot) => slots[slot] !== undefined);

  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="lg" />
          <h1 className="mt-3 text-xl font-normal text-stone-900">
            Translation Service
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Paste a token to save translations. You can still browse without
            one.
          </p>
          <p className="mt-1 font-mono text-xs text-stone-400">
            {API_ENVIRONMENT} · {API_HOST}
          </p>
        </div>

        <div className="space-y-3">
          {SLOT_IDS.map((slot) => (
            <TokenSlot key={slot} slot={slot} />
          ))}
        </div>

        <div className="mt-4 text-center">
          {held.length > 0 && (
            <button
              type="button"
              onClick={enter}
              className="w-full rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Continue
            </button>
          )}

          <button
            type="button"
            onClick={continueAnonymously}
            className="mt-3 text-xs font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
          >
            Continue without signing in
          </button>
        </div>
      </div>
    </div>
  );
}
