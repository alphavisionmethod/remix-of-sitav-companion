// SITA OS — Mode-Aware Calendar Data Hook
import { useQuery } from "@tanstack/react-query";
import { useDataMode } from "@/contexts/DataModeContext";
import { fetchCalendarEvents, type CalendarEventItem } from "@/lib/data-services/calendar-data-service";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";

export function useCalendarEvents(year: number, month: number) {
  const { isDemoMode } = useDataMode();
  const mode: RealityModeKey = isDemoMode ? "demo" : "real";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["calendar-events", year, month, mode],
    queryFn: async () => {
      const result = await fetchCalendarEvents(year, month, mode);
      return result.data;
    },
    staleTime: isDemoMode ? Infinity : 30_000,
    refetchOnWindowFocus: !isDemoMode,
  });

  return {
    events: data ?? [],
    isLoading: !isDemoMode && isLoading,
    isDemo: isDemoMode,
    error: error as Error | null,
    refetch,
  };
}
