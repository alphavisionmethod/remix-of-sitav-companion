// ═══════════════════════════════════════════════════════════════
// SITA OS — useAdvisorController (Phase 2)
// React-side wrapper for the per-advisor closed-loop controller.
// Components can call `runOnce()` to drive a single cycle and read
// the most recent result. The bootstrap loop drives the periodic
// cycles for the default advisor set.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import {
  runControllerCycle,
  runControllersForAdvisors,
  DEFAULT_CONTROLLED_ADVISORS,
  type ControllerCycleResult,
} from "@/lib/autonomy/controller";

export function useAdvisorController(advisorId?: string) {
  const [lastResult, setLastResult] = useState<ControllerCycleResult | null>(null);
  const [running, setRunning] = useState(false);

  const runOnce = useCallback(
    async (overrideId?: string) => {
      const id = overrideId ?? advisorId;
      if (!id) return null;
      setRunning(true);
      try {
        const r = await runControllerCycle(id);
        setLastResult(r);
        return r;
      } finally {
        setRunning(false);
      }
    },
    [advisorId],
  );

  const runAllDefault = useCallback(async () => {
    setRunning(true);
    try {
      const rs = await runControllersForAdvisors(DEFAULT_CONTROLLED_ADVISORS);
      setLastResult(rs[rs.length - 1] ?? null);
      return rs;
    } finally {
      setRunning(false);
    }
  }, []);

  return { runOnce, runAllDefault, lastResult, running };
}