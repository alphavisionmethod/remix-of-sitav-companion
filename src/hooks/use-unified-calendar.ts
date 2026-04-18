// SITA OS — Unified Calendar Hook
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";
import { toast } from "sonner";
import {
  fetchUnifiedCalendarEvents,
  type CalendarSource,
  type UnifiedCalendarEvent,
} from "@/data/repositories/unified-calendar-service";

export type { UnifiedCalendarEvent, CalendarSource };

const ALL_SOURCES: CalendarSource[] = ["personal", "business", "finance", "concierge", "household"];

export function useCalendarSources() {
  const [sources, setSources] = useState<CalendarSource[]>([...ALL_SOURCES]);

  const toggleSource = useCallback((source: CalendarSource) => {
    setSources(prev =>
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  }, []);

  return { sources, toggleSource, allSources: ALL_SOURCES };
}

export function useUnifiedCalendar(year: number, month: number, sources: CalendarSource[]) {
  const { isDemoMode } = useDataMode();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unified-calendar", year, month, sources.sort().join(","), isDemoMode],
    queryFn: () => fetchUnifiedCalendarEvents(year, month, sources, isDemoMode),
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

// ── CRUD Mutations ─────────────────────────────────────────

export interface CalendarEventInput {
  title: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  domain?: string;
  event_type?: string;
  location?: string;
  priority?: string;
  notes?: string;
  color?: string;
  recurring?: string;
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: CalendarEventInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await fromTable("calendar_events").insert({
        ...event,
        user_id: user.id,
        source: "manual",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      toast.success("Event created");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CalendarEventInput>) => {
      const { error } = await fromTable("calendar_events").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      toast.success("Event updated");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unified-calendar"] });
      toast.success("Event deleted");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}
