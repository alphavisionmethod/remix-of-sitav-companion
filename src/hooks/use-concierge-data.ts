import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function useTravelPlans() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["travel-plans", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("travel_plans").select("*").eq("user_id", uid!).order("start_date");
      return data ?? [];
    },
  });
}

export function useGroceryLists() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["grocery-lists", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("grocery_lists").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useGroceryItems(listId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["grocery-items", uid, listId],
    enabled: !!uid && !!listId,
    queryFn: async () => {
      const { data } = await fromTable("grocery_items").select("*").eq("user_id", uid!).eq("list_id", listId!);
      return data ?? [];
    },
  });
}

export function useServiceProvidersList() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["service-providers-list", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("service_providers_list").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useSchoolActivities() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["school-activities", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("school_activities").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useGiftTracker() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["gift-tracker", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("gift_tracker").select("*").eq("user_id", uid!).order("target_date");
      return data ?? [];
    },
  });
}

export function useAppointments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["appointments", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("appointments").select("*").eq("user_id", uid!).order("appointment_date");
      return data ?? [];
    },
  });
}

// ═══ New Concierge Hooks ═══

export function useErrands() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-errands", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_errands").select("*").eq("user_id", uid!).order("due_date");
      return data ?? [];
    },
  });
}

export function useCreateErrand() {
  const uid = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (errand: {
      title: string;
      location?: string;
      priority?: string;
      estimated_minutes?: number;
      combinable?: boolean;
      due_date?: string;
      bundle_id?: string;
      notes?: string;
      status?: string;
    }) => {
      const { data, error } = await fromTable("concierge_errands").insert({ ...errand, user_id: uid! }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-errands"] }),
  });
}

export function useUpdateErrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await fromTable("concierge_errands").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-errands"] }),
  });
}

export function useDeleteErrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("concierge_errands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["concierge-errands"] }),
  });

export function useRecurringObligations() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-recurring-obligations", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_recurring_obligations").select("*").eq("user_id", uid!).order("next_due");
      return data ?? [];
    },
  });
}

export function useConciergeAutomations() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-automations", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_automations").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useConciergeDocuments() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["concierge-documents", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("concierge_documents").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
