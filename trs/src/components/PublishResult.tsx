import type { PublishableLayer } from "../api/client";
import type { PublishOutcome } from "../api/publish";
import { StatusPill } from "./StatusPill";

const MEANINGS: Record<number, string> = {
  200: "Replaced the existing layer file.",
  201: "Created the layer file — it did not exist yet.",
  400: "The request body failed validation, or the token carries no usable tenant id.",
  422: "A key in this file is not declared by the module's default layer.",
  500: "The service failed while storing the file.",
};

const FORBIDDEN: Record<PublishableLayer, string> = {
  default:
    "The default layer is published by the module's own CI pipeline, which authenticates as itself. No pasted token reaches it.",
  managed:
    "The managed layer is restricted to Extenda. A customer-tenant token is denied here even with trs.translation.publish.",
  tenant:
    "The token is missing trs.translation.publish. That permission alone opens the tenant layer.",
};

function meaningFor(status: number, layer: PublishableLayer): string {
  if (status === 403) return FORBIDDEN[layer];

  return MEANINGS[status] ?? "Unexpected response.";
}

export function PublishResult({
  outcome,
  layer,
}: {
  outcome: PublishOutcome;
  layer: PublishableLayer;
}) {
  const succeeded = outcome.status >= 200 && outcome.status < 300;

  return (
    <div className="px-4 py-4">
      <div
        className={`rounded-lg border px-4 py-3 ${
          succeeded
            ? "border-emerald-200 bg-emerald-50"
            : "border-stone-200 bg-stone-50"
        }`}
      >
        <div className="flex items-start gap-2">
          <StatusPill status={outcome.status} />
          <p className="text-sm text-stone-800">
            {meaningFor(outcome.status, layer)}
          </p>
        </div>
        {outcome.messages.length > 0 && (
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-stone-600">
            {outcome.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
