import type { EntityConditionViewDto } from "../api/client";
import { DEMO_CATALOG, formatPrice, type CatalogProduct } from "../lib/catalog";
import { Badge } from "./Badge";
import { Panel } from "./Panel";

export function CatalogPanel({
  conditions,
  catalogLoaded,
  onAdd,
}: {
  conditions: EntityConditionViewDto[];
  /** Until the catalog is read, an id is unverified rather than missing. */
  catalogLoaded: boolean;
  onAdd: (product: CatalogProduct) => void;
}) {
  const known = new Set(conditions.map((condition) => condition.id));

  return (
    <Panel
      title="Items"
      subtitle="Tap to add a line. Each item claims the condition ids the checkout should ask about."
    >
      <ul className="grid grid-cols-2 gap-2 p-3">
        {DEMO_CATALOG.map((product) => (
          <li key={product.sku}>
            <button
              type="button"
              onClick={() => onAdd(product)}
              className="flex h-full w-full flex-col gap-1.5 rounded-lg border border-stone-200 p-2.5 text-left hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex items-baseline gap-2">
                <span aria-hidden="true">{product.glyph}</span>
                <span className="text-sm text-stone-900">{product.name}</span>
              </span>
              <span className="text-xs text-stone-500">
                {formatPrice(product.price)}
              </span>
              <span className="mt-auto flex flex-wrap gap-1">
                {product.conditionIds.length === 0 ? (
                  <Badge tone="neutral">no conditions</Badge>
                ) : (
                  product.conditionIds.map((id) => (
                    <Badge
                      key={id}
                      mono
                      tone={
                        !catalogLoaded
                          ? "neutral"
                          : known.has(id)
                            ? "brand"
                            : "warning"
                      }
                      title={
                        !catalogLoaded
                          ? "The condition catalog has not been read yet"
                          : known.has(id)
                            ? "In the tenant's resolved catalog"
                            : "Not in the catalog — evaluating it returns 404"
                      }
                    >
                      {id}
                    </Badge>
                  ))
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
