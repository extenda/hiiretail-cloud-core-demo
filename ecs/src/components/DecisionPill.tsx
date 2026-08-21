import type { Decision } from "../api/client";
import { DECISION_LABEL, DECISION_TONE } from "../lib/decisions";

export function DecisionPill({
  decision,
  showCode = true,
}: {
  decision: Decision;
  showCode?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${DECISION_TONE[decision]}`}
    >
      {DECISION_LABEL[decision]}
      {showCode && (
        <span className="font-mono text-[10px] opacity-70">{decision}</span>
      )}
    </span>
  );
}
