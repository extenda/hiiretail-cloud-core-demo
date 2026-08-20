import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  upsertEntityCondition,
  type EntityConditionRule,
  type EntityConditionViewDto,
  type UpsertEntityConditionRequestDto,
} from "../api/client";
import { CONDITIONS_QUERY_KEY } from "../hooks/useConditions";
import { errorMessage } from "../lib/api-error";
import { FIELD_LABEL, INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON } from "../lib/ui";
import { ErrorBlock } from "./ErrorBlock";
import { JsonBlock } from "./JsonBlock";
import { Modal } from "./Modal";

const RULES: { value: EntityConditionRule; label: string; hint: string }[] = [
  {
    value: "AGE_RESTRICTION",
    label: "AGE_RESTRICTION",
    hint: "Denies until the customer's age reaches the minimum on this condition.",
  },
  {
    value: "LICENSE_REQUIREMENT",
    label: "LICENSE_REQUIREMENT",
    hint: "The condition id is the license id the customer must hold, so there is nothing else to configure.",
  },
];

const ID_PATTERN = "[a-zA-Z0-9_.:-]+";

export function ConditionForm({
  editing,
  onClose,
}: {
  /** A TENANT condition to replace, or null to create a new one. */
  editing: EntityConditionViewDto | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [id, setId] = useState(editing?.id ?? "");
  const [rule, setRule] = useState<EntityConditionRule>(
    editing?.rule ?? "AGE_RESTRICTION",
  );
  const [enabled, setEnabled] = useState(editing?.enabled ?? true);
  const [minimumAge, setMinimumAge] = useState(
    editing && editing.rule === "AGE_RESTRICTION"
      ? String(
          (editing.condition_value as { minimum_age?: number }).minimum_age ?? 18,
        )
      : "18",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const body: UpsertEntityConditionRequestDto = {
    rule,
    enabled,
    condition_value:
      rule === "AGE_RESTRICTION" ? { minimum_age: Number(minimumAge) } : {},
  };

  const valid =
    id.trim().length > 0 &&
    (rule !== "AGE_RESTRICTION" ||
      (minimumAge !== "" && Number(minimumAge) >= 0));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;

    setSaving(true);
    setError(null);
    try {
      const res = await upsertEntityCondition({
        path: { id: id.trim() },
        body,
      });

      if (res.error || !res.data) {
        setError(errorMessage(res.error, res.response));

        return;
      }

      await queryClient.invalidateQueries({ queryKey: CONDITIONS_QUERY_KEY });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? `Edit ${editing.id}` : "New tenant condition"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="condition-form"
            className={PRIMARY_BUTTON}
            disabled={!valid || saving}
          >
            {saving ? "Saving…" : editing ? "Save" : "Create"}
          </button>
        </>
      }
    >
      <form id="condition-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="condition-id" className={FIELD_LABEL}>
            Condition id
          </label>
          <input
            id="condition-id"
            value={id}
            disabled={editing !== null}
            maxLength={64}
            pattern={ID_PATTERN}
            onChange={(event) => setId(event.target.value)}
            placeholder="tobacco_license_se"
            className={`${INPUT} font-mono`}
          />
          <p className="mt-1 text-xs text-stone-400">
            The catalog key items refer to. Global ids are reserved by the
            platform — reusing one is rejected with 409.
          </p>
        </div>

        <div>
          <label htmlFor="condition-rule" className={FIELD_LABEL}>
            Rule
          </label>
          <select
            id="condition-rule"
            value={rule}
            onChange={(event) =>
              setRule(event.target.value as EntityConditionRule)
            }
            className={INPUT}
          >
            {RULES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">
            {RULES.find((option) => option.value === rule)?.hint}
          </p>
        </div>

        {rule === "AGE_RESTRICTION" && (
          <div>
            <label htmlFor="minimum-age" className={FIELD_LABEL}>
              Minimum age
            </label>
            <input
              id="minimum-age"
              type="number"
              min={0}
              value={minimumAge}
              onChange={(event) => setMinimumAge(event.target.value)}
              className={INPUT}
            />
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-stone-800">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500/20"
          />
          Enabled
          <span className="text-xs text-stone-400">
            (a disabled condition answers 404 on evaluate)
          </span>
        </label>

        {error && <ErrorBlock title="The API rejected this">{error}</ErrorBlock>}

        <div>
          <p className={`${FIELD_LABEL} font-mono`}>
            PUT /entity-conditions/{id.trim() || "{id}"}
          </p>
          <JsonBlock value={body} maxHeight="max-h-48" />
        </div>
      </form>
    </Modal>
  );
}
