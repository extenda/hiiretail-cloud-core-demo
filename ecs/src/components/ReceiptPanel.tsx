import { useState } from "react";
import type { EvaluationResultDto } from "../api/client";
import {
  summarizeCheckout,
  summarizeLine,
  type CheckoutOutcome,
  type LineOutcome,
  type Prompt,
} from "../lib/checkout";
import { reasonText } from "../lib/decisions";
import { LINK_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from "../lib/ui";
import { Badge } from "./Badge";
import { DecisionPill } from "./DecisionPill";
import { JsonBlock } from "./JsonBlock";
import { Panel } from "./Panel";

const PROMPT_LABEL: Record<Prompt, string> = {
  AGE: "Ask the customer's age",
  LICENSES: "Resolve the customer's licenses",
};

function ResultRow({ result }: { result: EvaluationResultDto }) {
  const target = result.restriction ?? result.id;

  return (
    <li className="flex flex-wrap items-baseline gap-2 border-b border-stone-100 px-4 py-2 last:border-b-0">
      <DecisionPill decision={result.decision} showCode={false} />
      <span className="font-mono text-xs text-stone-500">{result.rule}</span>
      {target && (
        <span className="font-mono text-xs text-stone-700">{target}</span>
      )}
      <span className="text-sm text-stone-700">
        {reasonText(result.reason) ?? "Allowed."}
      </span>
      {result.reason && (
        <span className="font-mono text-[10px] text-stone-400">
          {result.reason}
        </span>
      )}
    </li>
  );
}

function LineBlock({ line }: { line: LineOutcome }) {
  const [showRaw, setShowRaw] = useState(false);
  const summary = summarizeLine(line);

  return (
    <div className="border-b border-stone-100 last:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-900">{line.name}</span>
          <span className="font-mono text-xs text-stone-400">{line.sku}</span>
        </div>
        <div className="flex items-center gap-2">
          {summary.state === "NO_CONDITIONS" && (
            <Badge tone="neutral">nothing to check</Badge>
          )}
          {summary.state === "UNCHECKED" && (
            <Badge tone="warning">not evaluated</Badge>
          )}
          {summary.state === "DECIDED" && (
            <DecisionPill decision={summary.decision} />
          )}
          {summary.state === "ERROR" && <Badge tone="danger">call failed</Badge>}
          {line.checks.length > 0 && (
            <button
              type="button"
              className={LINK_BUTTON}
              onClick={() => setShowRaw((value) => !value)}
            >
              {showRaw ? "hide raw" : "raw"}
            </button>
          )}
        </div>
      </div>

      {summary.failures.length > 0 && (
        <ul className="px-4 pb-2">
          {summary.failures.map((failure, index) => (
            <li
              key={`${failure.conditionId ?? "project"}-${index}`}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
            >
              <span className="font-mono">
                {failure.conditionId ?? "project-restrictions"}
              </span>{" "}
              — {failure.failure.status ?? "network"}:{" "}
              {failure.failure.message}
            </li>
          ))}
        </ul>
      )}

      {summary.results.length > 0 && (
        <ul className="border-t border-stone-100">
          {summary.results.map((result, index) => (
            <ResultRow key={`${result.id ?? result.rule}-${index}`} result={result} />
          ))}
        </ul>
      )}

      {summary.state === "UNCHECKED" && (
        <p className="px-4 pb-3 text-xs text-amber-700">
          The API resolved the condition but returned no results, so no rule ran
          on it yet — the evaluation bundle is rebuilt asynchronously after a
          condition changes.
        </p>
      )}

      {showRaw && (
        <div className="space-y-2 px-4 pb-3">
          {line.checks.map((check, index) => (
            <div key={`${check.conditionId ?? "project"}-${index}`}>
              <p className="mb-1 font-mono text-[10px] text-stone-500">
                {(check.request as { url?: string }).url}
              </p>
              <JsonBlock
                value={{
                  request: (check.request as { body?: unknown }).body,
                  response: check.decision ?? check.failure,
                }}
                maxHeight="max-h-64"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReceiptPanel({
  outcome,
  evaluating,
  onPrompt,
  onReevaluate,
}: {
  outcome: CheckoutOutcome;
  evaluating: boolean;
  onPrompt: (prompt: Prompt) => void;
  onReevaluate: () => void;
}) {
  const summary = summarizeCheckout(outcome);

  const banner = summary.blocked
    ? summary.decision === "SOFT_DENY" && summary.errorCount === 0
      ? {
          tone: "border-amber-200 bg-amber-50 text-amber-900",
          title: "The checkout needs more input before it can finish.",
        }
      : {
          tone: "border-red-200 bg-red-50 text-red-900",
          title: "The checkout is blocked.",
        }
    : {
        tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
        title: "Every line is allowed.",
      };

  return (
    <Panel
      title="Decision"
      subtitle={
        outcome.projectId
          ? `Entity conditions plus project ${outcome.projectId}`
          : "Entity conditions only"
      }
      actions={
        <button
          type="button"
          className={SECONDARY_BUTTON}
          onClick={onReevaluate}
          disabled={evaluating}
        >
          {evaluating ? "Evaluating…" : "Re-evaluate"}
        </button>
      }
    >
      <div className={`m-4 rounded-lg border px-4 py-3 ${banner.tone}`}>
        <p className="text-sm font-medium">{banner.title}</p>
        <p className="mt-1 text-xs">
          {summary.errorCount > 0 &&
            `${summary.errorCount} line${summary.errorCount === 1 ? "" : "s"} could not be evaluated. `}
          {summary.uncheckedCount > 0 &&
            `${summary.uncheckedCount} line${summary.uncheckedCount === 1 ? "" : "s"} had no rule to run. `}
          {summary.prompts.length === 0
            ? "No further input is needed."
            : "Collect the missing input, then evaluate again."}
        </p>

        {summary.prompts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={PRIMARY_BUTTON}
                onClick={() => onPrompt(prompt)}
              >
                {PROMPT_LABEL[prompt]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-stone-100">
        {outcome.lines.map((line) => (
          <LineBlock key={line.sku} line={line} />
        ))}
      </div>
    </Panel>
  );
}
