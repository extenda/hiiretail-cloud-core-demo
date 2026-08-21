import { useState, type FormEvent } from "react";
import { BrandMark } from "../components/BrandMark";
import { API_ENVIRONMENT } from "../lib/environment";
import { useAuth } from "./useAuth";

const FIELD =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none";

export function CredentialsForm() {
  const { error, submitCredentials } = useAuth();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) return;

    setSubmitting(true);
    try {
      await submitCredentials({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark size="lg" />
          <h1 className="mt-3 text-xl font-normal text-stone-900">
            Entity Conditions Service
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Sign in with OCMS client credentials to evaluate a checkout and
            manage the tenant condition catalog.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="mb-1 block text-xs font-medium text-stone-600"
              >
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                autoComplete="username"
                required
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                placeholder="your-client-id"
                className={FIELD}
              />
            </div>

            <div>
              <label
                htmlFor="clientSecret"
                className="mb-1 block text-xs font-medium text-stone-600"
              >
                Client Secret
              </label>
              <input
                id="clientSecret"
                type="password"
                autoComplete="current-password"
                required
                value={clientSecret}
                onChange={(event) => setClientSecret(event.target.value)}
                placeholder="your-client-secret"
                className={FIELD}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium">Authentication failed</p>
              <p className="mt-1 text-xs break-words text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !clientId.trim() || !clientSecret.trim()}
            className="mt-5 w-full rounded-lg bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Authenticating…" : "Connect"}
          </button>

          <p className="mt-4 text-center text-xs text-stone-400">
            OCMS client-credentials grant against the{" "}
            <span className="font-mono">{API_ENVIRONMENT}</span> auth service.
            The client needs{" "}
            <span className="font-mono">ecs.condition.read</span>,{" "}
            <span className="font-mono">ecs.condition.write</span>,{" "}
            <span className="font-mono">ecs.condition.evaluate</span> and{" "}
            <span className="font-mono">ecs.project-restriction.evaluate</span>.
          </p>
        </form>
      </div>
    </div>
  );
}
