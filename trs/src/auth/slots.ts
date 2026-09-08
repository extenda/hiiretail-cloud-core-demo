import type { PublishableLayer } from "../api/client";
import type { SlotId } from "./storage";

export type WritableLayer = "managed" | "tenant";

interface SlotMeta {
  label: string;
  hint: string;
  short: string;
}

export const SLOT_META: Record<SlotId, SlotMeta> = {
  extenda: {
    label: "Extenda",
    short: "Global",
    hint: "Saves the global copy.",
  },
  tenant: {
    label: "Customer",
    short: "Customer",
    hint: "Saves this customer's own wording.",
  },
};

export function slotForLayer(layer: PublishableLayer): SlotId | undefined {
  if (layer === "managed") return "extenda";
  if (layer === "tenant") return "tenant";

  return undefined;
}

export function layerForSlot(slot: SlotId): WritableLayer {
  return slot === "extenda" ? "managed" : "tenant";
}

export function layerLabel(layer: WritableLayer): string {
  return layer === "managed" ? "Global copy" : "This tenant";
}
