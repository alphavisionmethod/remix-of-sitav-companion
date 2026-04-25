// ═══════════════════════════════════════════════════════════════
// Personal Brain — Profile hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbProfile = Database["public"]["Tables"]["pb_profile"]["Row"];

export function usePbProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PbProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("pb_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data ?? null) as PbProfile | null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(
    async (patch: Partial<PbProfile>) => {
      if (!user) return;
      setSaving(true);
      const { data, error } = await supabase
        .from("pb_profile")
        .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" })
        .select()
        .maybeSingle();
      setSaving(false);
      if (error) {
        console.error("pb_profile upsert error", error);
        return;
      }
      if (data) setProfile(data as PbProfile);
    },
    [user],
  );

  return { profile, loading, saving, update, refresh };
}
