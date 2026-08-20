import { useState } from "react";
import type { EntityConditionViewDto } from "../api/client";
import type { CustomerState } from "../lib/checkout";
import { toEvaluationContext } from "../lib/checkout";
import { licenseConditionIds } from "../hooks/useConditions";
import { FIELD_LABEL, INPUT, LINK_BUTTON, SECONDARY_BUTTON } from "../lib/ui";
import { JsonBlock } from "./JsonBlock";
import { Panel } from "./Panel";

const AGE_SHORTCUTS = [15, 17, 18, 25];

export function CustomerPanel({
  customer,
  conditions,
  onChange,
  ageInputRef,
}: {
  customer: CustomerState;
  conditions: EntityConditionViewDto[];
  onChange: (next: CustomerState) => void;
  ageInputRef?: React.Ref<HTMLInputElement>;
}) {
  const [extraLicense, setExtraLicense] = useState("");
  const [showContext, setShowContext] = useState(false);

  const catalogLicenses = licenseConditionIds(conditions);
  const licenseOptions = Array.from(
    new Set([...catalogLicenses, ...customer.licenses]),
  );

  const toggleLicense = (id: string) => {
    onChange({
      ...customer,
      licenses: customer.licenses.includes(id)
        ? customer.licenses.filter((license) => license !== id)
        : [...customer.licenses, id],
    });
  };

  return (
    <Panel
      title="Customer"
      subtitle="What the operator has asked so far. Anything left unasked comes back as SOFT_DENY."
      actions={
        <button
          type="button"
          className={LINK_BUTTON}
          onClick={() => setShowContext((value) => !value)}
        >
          {showContext ? "Hide context" : "Show context"}
        </button>
      }
    >
      <div className="space-y-4 p-4">
        <div>
          <label className="flex items-center gap-2 text-sm text-stone-800">
            <input
              type="checkbox"
              checked={customer.ageAsked}
              onChange={(event) =>
                onChange({
                  ...customer,
                  ageAsked: event.target.checked,
                  age: event.target.checked ? customer.age : null,
                })
              }
              className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500/20"
            />
            Age asked
          </label>

          {customer.ageAsked ? (
            <div className="mt-2 space-y-2">
              <label htmlFor="customer-age" className={FIELD_LABEL}>
                Customer age
              </label>
              <input
                id="customer-age"
                ref={ageInputRef}
                type="number"
                min={0}
                value={customer.age ?? ""}
                placeholder="asked, not answered"
                onChange={(event) =>
                  onChange({
                    ...customer,
                    age:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
                className={INPUT}
              />
              <div className="flex gap-1.5">
                {AGE_SHORTCUTS.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => onChange({ ...customer, age })}
                    className="rounded-lg border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50"
                  >
                    {age}
                  </button>
                ))}
              </div>
              {customer.age === null && (
                <p className="text-xs text-amber-700">
                  Sent as <span className="font-mono">customer_age: null</span>{" "}
                  — the rules read that as "not collected yet".
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-stone-400">
              <span className="font-mono">customer_age</span> is left out of the
              request entirely.
            </p>
          )}
        </div>

        <div className="border-t border-stone-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-stone-800">
            <input
              type="checkbox"
              checked={customer.licensesResolved}
              onChange={(event) =>
                onChange({ ...customer, licensesResolved: event.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500/20"
            />
            Licenses resolved
          </label>

          {customer.licensesResolved ? (
            <div className="mt-2 space-y-2">
              {licenseOptions.length === 0 ? (
                <p className="text-xs text-stone-500">
                  No <span className="font-mono">LICENSE_REQUIREMENT</span>{" "}
                  conditions in the catalog yet — add a license id below, or
                  create the condition on the Condition catalog screen.
                </p>
              ) : (
                <ul className="space-y-1">
                  {licenseOptions.map((id) => (
                    <li key={id}>
                      <label className="flex items-center gap-2 font-mono text-xs text-stone-700">
                        <input
                          type="checkbox"
                          checked={customer.licenses.includes(id)}
                          onChange={() => toggleLicense(id)}
                          className="h-4 w-4 rounded border-stone-300 text-brand-500 focus:ring-brand-500/20"
                        />
                        {id}
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <input
                  value={extraLicense}
                  onChange={(event) => setExtraLicense(event.target.value)}
                  placeholder="add a license id the customer holds"
                  className={`${INPUT} font-mono`}
                />
                <button
                  type="button"
                  className={SECONDARY_BUTTON}
                  disabled={extraLicense.trim() === ""}
                  onClick={() => {
                    toggleLicense(extraLicense.trim());
                    setExtraLicense("");
                  }}
                >
                  Add
                </button>
              </div>

              {customer.licenses.length === 0 && (
                <p className="text-xs text-amber-700">
                  Sent as <span className="font-mono">licenses: []</span> — the
                  customer holds none, which is a hard deny on any licensed item.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-xs text-stone-400">
              <span className="font-mono">licenses</span> is left out of the
              request entirely.
            </p>
          )}
        </div>

        {showContext && (
          <div className="border-t border-stone-100 pt-4">
            <p className={`${FIELD_LABEL} font-mono`}>context</p>
            <JsonBlock value={toEvaluationContext(customer)} maxHeight="max-h-48" />
          </div>
        )}
      </div>
    </Panel>
  );
}
