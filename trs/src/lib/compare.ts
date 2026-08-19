import type { ReadScope } from "../api/read";
import type { Lookup } from "./recent";
import { DEFAULT_LAYER_LANG_TAG } from "./translations";

export type CompareMode = "none" | "english" | "base";

const NO_SCOPE: ReadScope = { moduleId: "", langTag: "" };

export function compareScope(lookup: Lookup, mode: CompareMode): ReadScope {
  if (mode === "english") {
    return { ...lookup, langTag: DEFAULT_LAYER_LANG_TAG };
  }
  if (mode === "base") {
    return { moduleId: lookup.moduleId, langTag: lookup.langTag };
  }

  return NO_SCOPE;
}
