// ═══════════════════════════════════════════════════════════════
// SITA OS — useArmedKillSwitches hook (Phase 7)
// Reads the live armed kill switches from automation_kill_switches
// and exposes them as a Set<switchId>. Used by Meta-Arch admin
// surfaces to compute live Golden Path / Bounded Context health.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { KILL_SWITCH_REGISTRY } from "@/lib/control-plane/kill-switch-registry";

interface ArmedSwitchesResult {
  readonly armed: ReadonlySet<string>;
  readonly armedList: readonly string[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/**
 * Map runtime `automation_kill_switches.scope` values to canonical
 * KS-* registry IDs. The runtime table predates Phase 4 and uses
 * lowercase scope strings (e.g. "advisors", "outbound").
 */
const SCOPE_TO_SWITCH: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const sw of KILL_SWITCH_REGISTRY) {
    map[sw.target] = sw.switchId;
    map[sw.switchId.toLowerCase()] = sw.switchId;
  }
  return map;
})();

export function useArmedKillSwitches(): ArmedSwitchesResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["meta-arch", "armed-kill-switches"],
    queryFn: async () => {
      const { data } = await fromTable("automation_kill_switches")
        .select("scope, scope_id, enabled");
      return (data ?? []) as Array<{ scope: string; scope_id: string | null; enabled: boolean }>;
    },
    staleTime: 15_000,
  });

  return useMemo(() => {
    const armed = new Set<string>();
    for (const row of data ?? []) {
      if (!row.enabled) continue;
      const id = SCOPE_TO_SWITCH[row.scope] ?? SCOPE_TO_SWITCH[row.scope?.toLowerCase?.()];
      if (id) armed.add(id);
    }
    return {
      armed,
      armedList: Array.from(armed),
      isLoading,
      isError,
    };
  }, [data, isLoading, isError]);
}
