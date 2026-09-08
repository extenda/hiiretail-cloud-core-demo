import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { useLanguageTags } from "../hooks/useLanguageTags";
import { useModuleCoverage } from "../hooks/useCoverage";
import { useSelectedApp } from "../hooks/useSelectedApp";
import { useAuth } from "../auth/useAuth";
import { languageName } from "../lib/translations";
import { APPS, type AppModule } from "../lib/apps";

function LanguageChip({
  tag,
  missingKeys,
}: {
  tag: string;
  missingKeys?: number;
}) {
  const incomplete = (missingKeys ?? 0) > 0;

  return (
    <span
      title={incomplete ? `${missingKeys} key(s) missing` : undefined}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
        incomplete ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-600"
      }`}
    >
      {incomplete && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
      {languageName(tag)}
    </span>
  );
}

function ModuleCard({
  app,
  onGo,
}: {
  app: AppModule;
  onGo: () => void;
}) {
  const { slots } = useAuth();
  const tags = useLanguageTags(app.moduleId);
  // Coverage numbers are a bonus when an Extenda token is held — the card still works,
  // just without the missing-key markers, when browsing anonymously.
  const coverage = useModuleCoverage(app.moduleId, slots.extenda);
  const missingByTag = new Map(
    coverage.data?.languageTags.map((row) => [row.langTag, row.missingKeys]),
  );

  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-100 px-4 py-3">
        <h3 className="text-base font-medium text-stone-900">{app.name}</h3>
      </div>
      <div className="px-4 py-3">
        {tags.isPending && <Spinner label="Checking languages…" />}
        {tags.isError && (
          <p className="text-xs text-stone-500">No languages published yet.</p>
        )}
        {tags.data && (
          <div className="flex flex-wrap gap-1">
            {tags.data.body.languageTags.map((tag) => (
              <LanguageChip key={tag} tag={tag} missingKeys={missingByTag.get(tag)} />
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-stone-100 px-4 py-3">
        <button
          onClick={onGo}
          className="rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
        >
          Translate
        </button>
      </div>
    </div>
  );
}

export function ModulesPage() {
  const navigate = useNavigate();
  const [, selectApp] = useSelectedApp();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-normal text-stone-900">Apps</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {APPS.map((app) => (
          <ModuleCard
            key={app.moduleId}
            app={app}
            onGo={() => {
              selectApp(app.moduleId);
              navigate(`/translations/${app.moduleId}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
