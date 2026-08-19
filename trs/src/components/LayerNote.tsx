import type { ReactNode } from "react";
import type { PublishableLayer } from "../api/client";

const Mono = ({ children }: { children: ReactNode }) => (
  <span className="font-mono">{children}</span>
);

interface Note {
  tone: "info" | "warning";
  title: string;
  body: ReactNode;
}

const NOTES: Record<PublishableLayer, Note> = {
  tenant: {
    tone: "info",
    title: "Writes for the tenant your token names.",
    body: (
      <>
        The path carries no tenant id — the service reads it from the caller
        token and answers <Mono>400</Mono> when the token has none. A tenant
        override may translate <Mono>en-US</Mono> as well.
      </>
    ),
  },
  managed: {
    tone: "warning",
    title: "The managed layer needs an Extenda-tenant token.",
    body: (
      <>
        It is the global customer-facing copy, so it is restricted to Extenda on
        top of <Mono>trs.translation.publish</Mono>. A customer-tenant token gets{" "}
        <Mono>403</Mono> here and should publish <Mono>tenant</Mono> instead.
      </>
    ),
  },
  default: {
    tone: "warning",
    title: "The default layer is not publishable from this demo.",
    body: (
      <>
        It is authored in the module repository and published by that repo's own
        CI pipeline, so a pasted token gets <Mono>403</Mono> however many
        permissions it holds. It also only accepts <Mono>en-US</Mono>, and it is
        the file that declares the keys — the editor below is the module
        developer's view of it.
      </>
    ),
  },
};

const TONES = {
  info: "border-stone-200 bg-stone-50 text-stone-700",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function LayerNote({ layer }: { layer: PublishableLayer }) {
  const { tone, title, body } = NOTES[layer];

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${TONES[tone]}`}>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs opacity-90">{body}</p>
    </div>
  );
}
