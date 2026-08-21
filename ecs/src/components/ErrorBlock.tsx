import type { ReactNode } from "react";

export function ErrorBlock({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p className="font-medium">{title}</p>
      {children && (
        <div className="mt-1 text-xs break-words text-red-700">{children}</div>
      )}
    </div>
  );
}
