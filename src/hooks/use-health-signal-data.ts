// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Signal React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  fetchWearableProviders,
  fetchHealthSignalConsents,
  fetchWearableSignals,
  fetchReadinessStates,
  fetchSignalSubsystemReadiness,
  fetchInterruptionPosture,
  fetchVisibilityPolicies,
} from "@/data/repositories/health-signal-data-service";

export function useWearableProviders() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["wearable-providers", isDemoMode],
    queryFn: () => fetchWearableProviders(isDemoMode),
  });
}

export function useHealthSignalConsents() {
  return useQuery({
    queryKey: ["health-signal-consents", isDemoMode],
    queryFn: () => fetchHealthSignalConsents(isDemoMode),
  });
}

export function useWearableSignals(limit?: number) {
  return useQuery({
    queryKey: ["wearable-signals", isDemoMode, limit],
    queryFn: () => fetchWearableSignals(isDemoMode, limit),
  });
}

export function useReadinessStates(limit?: number) {
  return useQuery({
    queryKey: ["readiness-states", isDemoMode, limit],
    queryFn: () => fetchReadinessStates(isDemoMode, limit),
  });
}

export function useSignalSubsystemReadiness() {
  return useQuery({
    queryKey: ["signal-subsystem-readiness", isDemoMode],
    queryFn: () => fetchSignalSubsystemReadiness(isDemoMode),
  });
}

export function useInterruptionPosture() {
  return useQuery({
    queryKey: ["interruption-posture", isDemoMode],
    queryFn: () => fetchInterruptionPosture(isDemoMode),
  });
}

export function useVisibilityPolicies() {
  return useQuery({
    queryKey: ["visibility-policies", isDemoMode],
    queryFn: () => fetchVisibilityPolicies(isDemoMode),
  });
}
