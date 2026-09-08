import { useState } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "./bootstrap";
import { isOfflineSimulated, setOfflineSimulated } from "./storage";
import { withTenant } from "./tenant";

const LANDING_APP_URL = "http://localhost:5174/";

function languageLabel(tag: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

interface AppProps {
  tenantId?: string;
  languages: string[];
  offline: boolean;
}

export function App({ tenantId, languages, offline }: AppProps) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("Alex");
  const [jobs, setJobs] = useState(1);
  const [failed, setFailed] = useState(false);
  const simulated = isOfflineSimulated();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-900 text-[10px] font-semibold text-white">
          DS
        </div>
        <span className="text-sm font-medium text-stone-900">
          {t("service.header.title")}
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
          {tenantId ? `tenant: ${tenantId}` : "public"}
        </span>
        {offline && (
          <span
            className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"
            title="TRS wasn't reached this startup — serving what was cached from a previous one"
          >
            offline — from cache
          </span>
        )}

        <div className="flex-1" />

        <button
          onClick={() => {
            setOfflineSimulated(!simulated);
            location.reload();
          }}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
          title="Skips the network on the next startup, to demo the cache fallback without actually taking TRS down"
        >
          {simulated ? "Stop simulating offline" : "Simulate TRS offline"}
        </button>

        <label className="flex items-center gap-2 text-xs text-stone-500">
          Language
          <select
            value={i18n.language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm text-stone-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          >
            {languages.map((tag) => (
              <option key={tag} value={tag}>
                {languageLabel(tag)}
              </option>
            ))}
          </select>
        </label>

        <a
          href={withTenant(LANDING_APP_URL, tenantId)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
          {t("service.nav.backToLanding")}
        </a>
      </header>

      <main className="mx-auto flex max-w-md flex-1 flex-col gap-5 px-6 py-10">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-stone-600">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <p className="mt-2 text-sm text-stone-700">
            {t("service.welcome.message", { name: name || "there" })}
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-stone-700">
              {t("service.jobs.count", { count: jobs })}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setJobs((v) => Math.max(0, v - 1))}
                className="h-7 w-7 rounded-lg border border-stone-300 bg-white text-sm text-stone-700 hover:bg-stone-50"
              >
                −
              </button>
              <button
                onClick={() => setJobs((v) => v + 1)}
                className="h-7 w-7 rounded-lg border border-stone-300 bg-white text-sm text-stone-700 hover:bg-stone-50"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {t("service.status.active")}
            </span>
            <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-500/20">
              {t("service.status.inactive")}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          {failed ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-800">{t("service.error.generic")}</p>
              <button
                onClick={() => setFailed(false)}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                {t("service.action.retry")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setFailed(true)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Simulate error
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
