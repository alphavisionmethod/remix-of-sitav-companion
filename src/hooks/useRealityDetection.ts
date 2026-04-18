import { useQuery } from "@tanstack/react-query";
import { runFullDetection, type DetectionReport } from "@/lib/detection/reality-detection-engine";
import { getIntegrationStatuses, computeLaunchHonesty, fetchRouteInventory, getCoreServiceReality } from "@/integrations/external/reality-integration-hub";

export function useDetectionReport() {
  return useQuery<DetectionReport>({
    queryKey: ["reality-detection-report"],
    queryFn: runFullDetection,
    staleTime: 60_000,
  });
}

export function useIntegrationStatuses() {
  return useQuery({
    queryKey: ["reality-integration-statuses"],
    queryFn: getIntegrationStatuses,
    staleTime: 60_000,
  });
}

export function useLaunchHonesty() {
  return useQuery({
    queryKey: ["reality-launch-honesty"],
    queryFn: computeLaunchHonesty,
    staleTime: 60_000,
  });
}

export function useRouteInventory() {
  return useQuery({
    queryKey: ["reality-route-inventory"],
    queryFn: fetchRouteInventory,
    staleTime: 60_000,
  });
}

export function useCoreServiceReality() {
  return useQuery({
    queryKey: ["reality-core-services"],
    queryFn: async () => getCoreServiceReality(),
    staleTime: 300_000,
  });
}
