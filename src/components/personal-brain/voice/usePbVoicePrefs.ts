// ═══════════════════════════════════════════════════════════════
// Personal Brain — pb_voice_prefs CRUD hook (Phase 4)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export type PbVoicePrefs = Database["public"]["Tables"]["pb_voice_prefs"]["Row"];
export type PbVoicePrefsUpdate = Partial<
  Pick<
    PbVoicePrefs,
    "input_mode" | "voice_id" | "rate" | "pitch" | "autoread" | "use_cloud_stt" | "transcript_retention"
  >
>;

const DEFAULTS = {
  input_mode: "ptt",
  voice_id: "browser-default",
  rate: 1,
  pitch: 1,
  autoread: false,
  use_cloud_stt: false,
  transcript_retention: "session",
};

export function usePbVoicePrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PbVoicePrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setPrefs(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("pb_voice_prefs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setPrefs(data);
    } else {
      const seed = { user_id: user.id, ...DEFAULTS };
      const { data: created } = await supabase
        .from("pb_voice_prefs")
        .insert(seed)
        .select()
        .maybeSingle();
      setPrefs(created ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = useCallback(
    async (patch: PbVoicePrefsUpdate) => {
      if (!user) return;
      setSaving(true);
      const next = { ...(prefs ?? { user_id: user.id, ...DEFAULTS }), ...patch, user_id: user.id };
      const { data, error } = await supabase
        .from("pb_voice_prefs")
        .upsert(next, { onConflict: "user_id" })
        .select()
        .maybeSingle();
      if (!error && data) setPrefs(data);
      setSaving(false);
    },
    [user, prefs],
  );

  return { prefs, loading, saving, update, reload: load };
}