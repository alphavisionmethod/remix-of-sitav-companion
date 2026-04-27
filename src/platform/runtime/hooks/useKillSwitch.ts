import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getKillSwitchStatus,
  type KillSwitchStatus,
} from "@/lib/autonomy/kill-switch";

const DEFAULT: KillSwitchStatus = {
  engaged: false,
  reason: null,
  domainScope: null,
  engagedAt: null,
};

/**
 * Subscribes to the autonomy kill-switch row for the current user and
 * returns its live status. Updates within ~1s of any engage/release.
 */
export function useKillSwitch() {
  const [status, setStatus] = useState<KillSwitchStatus>(DEFAULT);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const s = await getKillSwitchStatus();
    setStatus(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
    const channel = supabase
      .channel("kill-switch-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "autonomy_kill_switch" },
        () => void reload(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  return { status, loading, reload };
}