import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function useTaxEstimates() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["tax-estimates", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("tax_estimates").select("*").eq("user_id", uid!).order("due_date");
      return data ?? [];
    },
  });
}

export function useReceivables() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["receivables", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("receivables").select("*").eq("user_id", uid!).order("due_date");
      return data ?? [];
    },
  });
}

export function useMoneyApprovals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["money-approvals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("money_approvals").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useBills() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["bills", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("bills").select("*").eq("user_id", uid!).order("due_date");
      return data ?? [];
    },
  });
}

export function useSubscriptions() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["subscriptions", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("subscriptions").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useSavingsGoals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["savings-goals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("savings_goals").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useMoneyAccounts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["money-accounts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("money_accounts").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}
