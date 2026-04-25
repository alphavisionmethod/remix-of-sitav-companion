import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbGoal = Database["public"]["Tables"]["pb_goals"]["Row"];

export function usePbGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<PbGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("pb_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(20);
    setGoals((data ?? []) as PbGoal[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateProgress = useCallback(
    async (id: string, progress_pct: number) => {
      if (!user) return;
      await supabase
        .from("pb_goals")
        .update({ progress_pct })
        .eq("id", id)
        .eq("user_id", user.id);
      await refresh();
    },
    [user, refresh],
  );

  return { goals, loading, refresh, updateProgress };
}