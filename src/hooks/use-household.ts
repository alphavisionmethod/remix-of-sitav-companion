import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
export function useHouseholds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["households", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable("households")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHouseholdMembers(householdId: string | null) {
  return useQuery({
    queryKey: ["household_members", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await fromTable("household_members")
        .select("*")
        .eq("household_id", householdId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useHouseholdSharedItems(householdId: string | null) {
  return useQuery({
    queryKey: ["household_shared_items", householdId],
    enabled: !!householdId,
    queryFn: async () => {
      const { data, error } = await fromTable("household_shared_items")
        .select("*")
        .eq("household_id", householdId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      const { error } = await fromTable("households").insert({ ...data, owner_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["households"] }); toast.success("Household created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddHouseholdMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { household_id: string; display_name: string; role: string }) => {
      const { error } = await fromTable("household_members").insert(data);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["household_members"] }); toast.success("Member added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteHouseholdMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable("household_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["household_members"] }); toast.success("Member removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
