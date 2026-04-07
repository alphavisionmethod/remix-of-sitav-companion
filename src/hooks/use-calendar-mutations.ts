// ═══════════════════════════════════════════════════════════════
// SITA OS — Calendar CRUD Mutations
// ═══════════════════════════════════════════════════════════════

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CalendarEventInput {
  title: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  domain?: string;
  event_type?: string;
  location?: string;
  priority?: string;
}

export function useCreateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: CalendarEventInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("calendar_events").insert({
        ...event,
        user_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event created");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useUpdateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CalendarEventInput>) => {
      const { error } = await supabase.from("calendar_events").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event updated");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}

export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Event deleted");
    },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });
}
