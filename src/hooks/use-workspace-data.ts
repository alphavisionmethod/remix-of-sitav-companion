// ═══════════════════════════════════════════════════════════════
// SITA OS — Workspace React Query Hooks
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import { fetchDocs, fetchSheets, fetchSlides } from "@/lib/data-services/workspace-data-service";

export function useDocsData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["workspace-docs", isDemoMode],
    queryFn: () => fetchDocs(isDemoMode),
  });
}

export function useSheetsData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["workspace-sheets", isDemoMode],
    queryFn: () => fetchSheets(isDemoMode),
  });
}

export function useSlidesData() {
  const { isDemoMode } = useDataMode();
  return useQuery({
    queryKey: ["workspace-slides", isDemoMode],
    queryFn: () => fetchSlides(isDemoMode),
  });
}
