// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification/Calm React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  fetchAttentionDecisions,
  fetchFatigueProfiles,
  fetchAssistantRolePresences,
  fetchAssistantRoleStates,
  fetchInterruptionPolicies,
  fetchNrcLaunchReadiness,
  fetchDeliveryRules,
  fetchCrossDeviceSurfaces,
  fetchHandoffFlows,
} from "@/data/repositories/notification-calm-data-service";

export function useAttentionDecisions() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["attention-decisions", isDemoMode],
    queryFn: () => fetchAttentionDecisions(isDemoMode),
  });
}

export function useFatigueProfiles() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["fatigue-profiles", isDemoMode],
    queryFn: () => fetchFatigueProfiles(isDemoMode),
  });
}

export function useAssistantRolePresences() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["assistant-role-presences", isDemoMode],
    queryFn: () => fetchAssistantRolePresences(isDemoMode),
  });
}

export function useAssistantRoleStates() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["assistant-role-states", isDemoMode],
    queryFn: () => fetchAssistantRoleStates(isDemoMode),
  });
}

export function useInterruptionPolicies() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["interruption-policies", isDemoMode],
    queryFn: () => fetchInterruptionPolicies(isDemoMode),
  });
}

export function useNrcLaunchReadiness() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["nrc-launch-readiness", isDemoMode],
    queryFn: () => fetchNrcLaunchReadiness(isDemoMode),
  });
}

export function useDeliveryRules() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["delivery-rules", isDemoMode],
    queryFn: () => fetchDeliveryRules(isDemoMode),
  });
}

export function useCrossDeviceSurfaces() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["cross-device-surfaces", isDemoMode],
    queryFn: () => fetchCrossDeviceSurfaces(isDemoMode),
  });
}

export function useHandoffFlows() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["handoff-flows", isDemoMode],
    queryFn: () => fetchHandoffFlows(isDemoMode),
  });
}
