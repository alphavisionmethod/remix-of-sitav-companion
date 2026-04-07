import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
      const { data } = await supabase.from("travel_plans").select("*").eq("user_id", uid!).order("start_date");
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
      const { data } = await supabase.from("grocery_lists").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
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
      const { data } = await supabase.from("grocery_items").select("*").eq("user_id", uid!).eq("list_id", listId!);
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
      const { data } = await supabase.from("service_providers_list").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("school_activities").select("*").eq("user_id", uid!);
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
      const { data } = await supabase.from("gift_tracker").select("*").eq("user_id", uid!).order("target_date");
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
      const { data } = await supabase.from("appointments").select("*").eq("user_id", uid!).order("appointment_date");
      return data ?? [];
    },
  });
}
