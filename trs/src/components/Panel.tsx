import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, subtitle, actions, children }: PanelProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-stone-900">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
