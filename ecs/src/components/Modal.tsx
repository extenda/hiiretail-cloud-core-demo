import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-base font-medium text-stone-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2 text-lg leading-none text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            ×
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-stone-100 px-4 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
