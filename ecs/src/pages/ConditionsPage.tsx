import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  deleteEntityCondition,
  type EntityConditionViewDto,
} from "../api/client";
import { ConditionForm } from "../components/ConditionForm";
import { ConditionsTable } from "../components/ConditionsTable";
import { ErrorBlock } from "../components/ErrorBlock";
import { Modal } from "../components/Modal";
import { Panel } from "../components/Panel";
import { Spinner } from "../components/Spinner";
import { CONDITIONS_QUERY_KEY, useConditions } from "../hooks/useConditions";
import { errorMessage } from "../lib/api-error";
import {
  DESTRUCTIVE_BUTTON,
  FIELD_LABEL,
  INPUT,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "../lib/ui";

type ScopeFilter = "ALL" | "GLOBAL" | "TENANT";
type RuleFilter = "ALL" | "AGE_RESTRICTION" | "LICENSE_REQUIREMENT";

export function ConditionsPage() {
  const queryClient = useQueryClient();
  const conditionsQuery = useConditions();

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("ALL");
  const [rule, setRule] = useState<RuleFilter>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EntityConditionViewDto | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<EntityConditionViewDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const conditions = useMemo(
    () => conditionsQuery.data ?? [],
    [conditionsQuery.data],
  );

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return conditions.filter(
      (condition) =>
        (scope === "ALL" || condition.scope === scope) &&
        (rule === "ALL" || condition.rule === rule) &&
        (needle === "" || condition.id.toLowerCase().includes(needle)),
    );
  }, [conditions, scope, rule, search]);

  const tenantCount = conditions.filter(
    (condition) => condition.scope === "TENANT",
  ).length;

  const confirmDelete = async (condition: EntityConditionViewDto) => {
    setDeletingId(condition.id);
    setDeleteError(null);
    try {
      const res = await deleteEntityCondition({ path: { id: condition.id } });
      if (res.error) {
        setDeleteError(errorMessage(res.error, res.response));

        return;
      }

      await queryClient.invalidateQueries({ queryKey: CONDITIONS_QUERY_KEY });
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-stone-900">
            Condition catalog
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Every global condition the platform owns, plus{" "}
            {tenantCount === 0
              ? "none of its own"
              : `the ${tenantCount} this tenant owns`}
            . The tenant is taken from the token — it is never a parameter.
          </p>
        </div>
        <button
          type="button"
          className={PRIMARY_BUTTON}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          New condition
        </button>
      </div>

      {conditionsQuery.isError && (
        <ErrorBlock title="Could not load conditions">
          {(conditionsQuery.error as Error).message}
        </ErrorBlock>
      )}

      {deleteError && (
        <ErrorBlock title="Delete was rejected">{deleteError}</ErrorBlock>
      )}

      <Panel
        title="Conditions"
        subtitle="Global conditions are read-only; tenant conditions are yours to change."
      >
        <div className="grid gap-3 border-b border-stone-100 p-4 sm:grid-cols-3">
          <div>
            <label htmlFor="condition-search" className={FIELD_LABEL}>
              Search id
            </label>
            <input
              id="condition-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="alcohol"
              className={`${INPUT} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="scope-filter" className={FIELD_LABEL}>
              Scope
            </label>
            <select
              id="scope-filter"
              value={scope}
              onChange={(event) => setScope(event.target.value as ScopeFilter)}
              className={INPUT}
            >
              <option value="ALL">All scopes</option>
              <option value="GLOBAL">GLOBAL</option>
              <option value="TENANT">TENANT</option>
            </select>
          </div>
          <div>
            <label htmlFor="rule-filter" className={FIELD_LABEL}>
              Rule
            </label>
            <select
              id="rule-filter"
              value={rule}
              onChange={(event) => setRule(event.target.value as RuleFilter)}
              className={INPUT}
            >
              <option value="ALL">All rules</option>
              <option value="AGE_RESTRICTION">AGE_RESTRICTION</option>
              <option value="LICENSE_REQUIREMENT">LICENSE_REQUIREMENT</option>
            </select>
          </div>
        </div>

        {conditionsQuery.isLoading ? (
          <Spinner label="Loading conditions…" />
        ) : (
          <ConditionsTable
            conditions={visible}
            deletingId={deletingId}
            onEdit={(condition) => {
              setEditing(condition);
              setFormOpen(true);
            }}
            onDelete={setPendingDelete}
          />
        )}
      </Panel>

      {formOpen && (
        <ConditionForm
          editing={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {pendingDelete && (
        <Modal
          title={`Delete ${pendingDelete.id}?`}
          onClose={() => setPendingDelete(null)}
          footer={
            <>
              <button
                type="button"
                className={SECONDARY_BUTTON}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={DESTRUCTIVE_BUTTON}
                disabled={deletingId !== null}
                onClick={() => confirmDelete(pendingDelete)}
              >
                {deletingId ? "Deleting…" : "Delete"}
              </button>
            </>
          }
        >
          <p className="text-sm text-stone-700">
            Items still referring to{" "}
            <span className="font-mono">{pendingDelete.id}</span> will get a 404
            from the evaluate endpoint until the id exists again.
          </p>
        </Modal>
      )}
    </div>
  );
}
