import { useState } from "react";
import { APPS } from "../lib/apps";

const KEY = "trs_selected_module";

// Shared across Read, Publish and Coverage so picking a module on one screen carries over
// to the others — there are only ever two, so "which one am I looking at" should not reset
// on every navigation.
export function useSelectedApp(): [string, (moduleId: string) => void] {
  const [moduleId, setModuleId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(KEY);

      return stored && APPS.some((app) => app.moduleId === stored)
        ? stored
        : APPS[0].moduleId;
    } catch {
      return APPS[0].moduleId;
    }
  });

  const select = (next: string) => {
    setModuleId(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  };

  return [moduleId, select];
}
