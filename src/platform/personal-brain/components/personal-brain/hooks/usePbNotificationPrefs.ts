// ═══════════════════════════════════════════════════════════════
// Personal Brain — Notification prefs hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbNotificationPrefs =
  Database["public"]["Tables"]["pb_notification_prefs"]["Row"];

const DEFAULTS: Omit<PbNotificationPrefs, "user_id" | "created_at" | "updated_at"> = {
  learning_reminders: "weekly",
  project_nudges: "weekly",
  continue_where_left_off: true,
  weekly_recap: true,
  inferred_pattern_review: true,
  daily_planning_prompt: false,
  voice_reflection_reminder: false,
  channel_in_app: true,
  channel_email: false,
};

export function usePbNotificationPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PbNotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setPrefs(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("pb_notification_prefs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) setPrefs(data as PbNotificationPrefs);
      else
        setPrefs({
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...DEFAULTS,
        } as PbNotificationPrefs);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<PbNotificationPrefs>) => {
      if (!user || !prefs) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      setSaving(true);
      await supabase
        .from("pb_notification_prefs")
        .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
      setSaving(false);
    },
    [user, prefs],
  );

  return { prefs, loading, saving, update };
}
