// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Brain Onboarding Gate Hook
// ═══════════════════════════════════════════════════════════════
// Loads the user's pb_profile row and exposes whether onboarding
// has completed. The page uses this to gate rendering between the
// 6-step ceremony and the dashboard / chat experience.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PBOnboardingState {
  loading: boolean;
  onboarded: boolean;
  profileExists: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePersonalBrainOnboarding(): PBOnboardingState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setOnboarded(false);
      setProfileExists(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from("pb_profile")
        .select("onboarded_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (qErr) throw qErr;
      setProfileExists(!!data);
      setOnboarded(!!data?.onboarded_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Brain profile");
      setOnboarded(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, onboarded, profileExists, error, refresh: load };
}

export default usePersonalBrainOnboarding;