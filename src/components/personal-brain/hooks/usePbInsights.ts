import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbMemory = Database["public"]["Tables"]["pb_memories"]["Row"];

export function usePbInsights(limit = 3) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PbMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setInsights([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("pb_memories")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("confidence", { ascending: false })
      .limit(limit);
    setInsights((data ?? []) as PbMemory[]);
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { insights, loading, refresh };
}