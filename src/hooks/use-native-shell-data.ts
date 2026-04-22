// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Shell Strategy React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  fetchNativeShellPlatforms,
  fetchCapabilitySurfaceBindings,
  fetchNssLaunchReadiness,
} from "@/data/repositories/native-shell-data-service";

export function useNativeShellPlatforms() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["native-shell-platforms", isDemoMode],
    queryFn: () => fetchNativeShellPlatforms(isDemoMode),
  });
}

export function useCapabilitySurfaceBindings() {
  return useQuery({
    queryKey: ["capability-surface-bindings", isDemoMode],
    queryFn: () => fetchCapabilitySurfaceBindings(isDemoMode),
  });
}

export function useNssLaunchReadiness() {
  return useQuery({
    queryKey: ["nss-launch-readiness", isDemoMode],
    queryFn: () => fetchNssLaunchReadiness(isDemoMode),
  });
}
