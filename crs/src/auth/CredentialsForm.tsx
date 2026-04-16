import { useState, type FormEvent } from "react";
import { useAuth } from "./useAuth";

export function CredentialsForm() {
  const { error, submitCredentials } = useAuth();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
            CRS
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Customer Registry Service
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your OCMS credentials to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                autoComplete="username"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                placeholder="your-client-id"
              />
            </div>

            <div>
              <label
                htmlFor="clientSecret"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Client Secret
              </label>
              <input
                id="clientSecret"
                type="password"
                autoComplete="current-password"
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                placeholder="your-client-secret"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-medium">Authentication failed:</span>{" "}
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !clientId.trim() || !clientSecret.trim()}
            className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Authenticating..." : "Connect"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Need credentials?{" "}
          <a
            href="https://testrunner.hiiretail.com/ocms/templates/local/crs/1?tab=clients"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 underline"
          >
            Create a client from the pre-built template
          </a>
        </p>
      </div>
    </div>
  );
}
