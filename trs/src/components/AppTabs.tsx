import { APPS } from "../lib/apps";

export function AppTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (moduleId: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-stone-600">App</label>
      <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5">
        {APPS.map((app) => (
          <button
            key={app.moduleId}
            type="button"
            onClick={() => onChange(app.moduleId)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              value === app.moduleId
                ? "bg-brand-500 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {app.name}
          </button>
        ))}
      </div>
    </div>
  );
}
