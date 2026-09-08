import { useState } from "react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "./bootstrap";
import { isOfflineSimulated, setOfflineSimulated } from "./storage";
import { withTenant } from "./tenant";

const SERVICE_APP_URL = "http://localhost:5175/";

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
  const [visits, setVisits] = useState(1);
  const simulated = isOfflineSimulated();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-900 text-[10px] font-semibold text-white">
          DL
        </div>
        <span className="text-sm font-medium text-stone-900">Demo Landing</span>
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
          {t("landing.nav.language")}
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
      </header>

      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div>
          <h1 className="text-3xl font-normal text-stone-900">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-2 text-sm text-stone-500">{t("landing.hero.subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVisits((v) => v + 1)}
            className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            +1
          </button>
          <span className="font-mono text-sm text-stone-700">
            {t("landing.visits.count", { count: visits })}
          </span>
        </div>

        <a
          href={withTenant(SERVICE_APP_URL, tenantId)}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {t("landing.cta.continue")}
        </a>
      </main>

      <footer className="border-t border-stone-200 px-4 py-3 text-center text-xs text-stone-400">
        {t("landing.footer.copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
