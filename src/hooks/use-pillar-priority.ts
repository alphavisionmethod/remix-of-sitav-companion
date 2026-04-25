// ════════════════════════════════════════════════════════════
// SITA OS — usePillarPriority hook (Phase 2)
// Single source of truth for ordering pillars + their capabilities
// in launchers, nav rails, and dashboards.
// ════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { PILLARS_BY_LAUNCHER_PRIORITY, ALL_CAPABILITIES, pillarForRoute } from "@/modules";

export function usePillarPriority() {
  return useMemo(
    () => ({
      pillars: PILLARS_BY_LAUNCHER_PRIORITY,
      capabilities: ALL_CAPABILITIES,
      pillarForRoute,
    }),
    [],
  );
}