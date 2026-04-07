import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function useMissionGoals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["mission-goals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("mission_goals").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useMissionMilestones(goalId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["mission-milestones", uid, goalId],
    enabled: !!uid && !!goalId,
    queryFn: async () => {
      const { data } = await fromTable("mission_milestones").select("*").eq("user_id", uid!).eq("goal_id", goalId!).order("due_date");
      return data ?? [];
    },
  });
}
