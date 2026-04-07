import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";


function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function useHealthLogs() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["health-logs", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("health_logs").select("*").eq("user_id", uid!).order("logged_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useVaultItems() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["vault-items", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("vault_items").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}
