// ═══════════════════════════════════════════════════════════════
// Personal Brain — Security Prefs hook (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PbSecurityPrefs {
  sensitive_mode: boolean;
  retention_days: number;
  autolearn_enabled: boolean;
  autolearn_threshold: number;
  learn_from_chats: boolean;
  learn_from_files: boolean;
  voice_transcript_retention: "none" | "session" | "persist";
}

const DEFAULTS: PbSecurityPrefs = {
  sensitive_mode: false,
  retention_days: 365,
  autolearn_enabled: true,
  autolearn_threshold: 0.7,
  learn_from_chats: true,
  learn_from_files: true,
  voice_transcript_retention: "session",
};

export function usePbSecurityPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PbSecurityPrefs | null>(null);
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
        .from("pb_security_prefs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setPrefs(data ? { ...DEFAULTS, ...(data as Partial<PbSecurityPrefs>) } : DEFAULTS);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<PbSecurityPrefs>) => {
      if (!user || !prefs) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      setSaving(true);
      const { error } = await supabase
        .from("pb_security_prefs")
        .upsert(
          { user_id: user.id, ...next },
          { onConflict: "user_id" },
        );
      setSaving(false);
      if (error) {
        console.error("pb_security_prefs upsert error", error);
      }
    },
    [user, prefs],
  );

  return { prefs, loading, saving, update };
}