import { FIELD_LABEL, INPUT } from "../lib/ui";
import { Panel } from "./Panel";

export function ProjectContextPanel({
  projectId,
  onChange,
}: {
  projectId: string;
  onChange: (projectId: string) => void;
}) {
  return (
    <Panel
      title="B2B project"
      subtitle="Optional. With a project id every line is also checked against the project's live CRS restrictions."
    >
      <div className="p-4">
        <label htmlFor="project-id" className={FIELD_LABEL}>
          CRS project id
        </label>
        <input
          id="project-id"
          value={projectId}
          onChange={(event) => onChange(event.target.value.trim())}
          placeholder="fc03c9aa-bbb9-413d-997a-be8e9f6f28f0"
          className={`${INPUT} font-mono`}
        />
        <p className="mt-1 text-xs text-stone-400">
          Restrictions are read from CRS per call, not from the condition
          catalog. Item attributes decide the outcome — see the Project
          restrictions screen to experiment with them.
        </p>
      </div>
    </Panel>
  );
}
