import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-stone-100 text-stone-600 ring-stone-500/20",
  brand: "bg-brand-50 text-brand-700 ring-brand-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

export function Badge({
  tone = "neutral",
  mono,
  title,
  children,
}: {
  tone?: BadgeTone;
  mono?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        TONES[tone]
      } ${mono ? "font-mono" : ""}`}
    >
      {children}
    </span>
  );
}
