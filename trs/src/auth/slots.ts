import type { PublishableLayer } from "../api/client";
import type { SlotId } from "./storage";

interface SlotMeta {
  label: string;
  hint: string;
}

export const SLOT_META: Record<SlotId, SlotMeta> = {
  extenda: {
    label: "Extenda tenant token",
    hint: "Publishes the global managed layer. Needs trs.translation.publish and a token belonging to Extenda.",
  },
  tenant: {
    label: "Customer tenant token",
    hint: "Publishes that tenant's own overrides. Needs trs.translation.publish; the tenant comes from the token.",
  },
};

export function slotForLayer(layer: PublishableLayer): SlotId | undefined {
  if (layer === "managed") return "extenda";
  if (layer === "tenant") return "tenant";

  return undefined;
}
