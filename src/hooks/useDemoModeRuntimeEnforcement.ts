// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Mode Runtime Enforcement Hook
// Side-effecting hook that:
//   1. Tags <body data-demo-mode="true|false"> for global CSS / E2E
//   2. Tags every analytics event with `mode: "demo"|"live"`
//   3. Emits a single console marker on transition for traceability
// Mounted once at the shell root.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useDataMode } from "@/contexts/DataModeContext";

export function useDemoModeRuntimeEnforcement() {
  const { isDemoMode, mode } = useDataMode();
  const lastModeRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Mark <body> for global CSS hooks and E2E selectors
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-demo-mode", String(isDemoMode));
      document.body.setAttribute("data-runtime-mode", mode);
    }

    // 2. Patch global analytics tagger (idempotent)
    if (typeof window !== "undefined") {
      (window as any).__SITA_RUNTIME_MODE__ = mode;
    }

    // 3. Single transition log
    if (lastModeRef.current && lastModeRef.current !== mode) {
      // eslint-disable-next-line no-console
      console.info(
        `%c[SITA] Runtime mode → ${mode.toUpperCase()}`,
        `color: ${isDemoMode ? "#f59e0b" : "#10b981"}; font-weight: bold;`,
      );
    }
    lastModeRef.current = mode;
  }, [isDemoMode, mode]);
}
