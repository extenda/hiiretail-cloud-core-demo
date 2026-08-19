import { useAuth } from "./useAuth";
import { TokenSlot } from "./TokenSlot";
import { SLOT_IDS } from "./storage";
import { BrandMark } from "../components/BrandMark";
import { API_ENVIRONMENT, API_HOST } from "../lib/environment";

export function TokenForm() {
  const { continueAnonymously } = useAuth();

  return (
    <div className="flex min-h-screen items-start justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="lg" />
          <h1 className="mt-3 text-xl font-normal text-stone-900">
            Translation Service
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Reading needs no token. Publishing needs one per layer — paste the
            ones you already have.
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

        <div className="mt-4 rounded-lg border border-stone-200 bg-white/60 p-4 text-center">
          <p className="text-xs text-stone-500">
            Any staff JWT for this environment works — copy the{" "}
            <span className="font-mono">Authorization</span> header your
            Operations Hub session sends. A machine client token works too; the
            layer a token may publish is decided by its tenant and permissions,
            not by its type.
          </p>
          <button
            type="button"
            onClick={continueAnonymously}
            className="mt-2 text-xs font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
          >
            Continue without a token
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-stone-400">
          Tokens stay in this browser's <span className="font-mono">localStorage</span>{" "}
          and are sent only to {API_HOST}.
        </p>
      </div>
    </div>
  );
}
