// ═══════════════════════════════════════════════════════════════
// SITA OS — useCronStatus (Jarvis)
// Reads the schedule + last-run summary for the daily Sita
// briefings cron job via the get_jarvis_cron_status RPC.
// Pure read, polls every 60s.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface JarvisCronStatus {
  jobname: string;
  schedule: string;
  active: boolean;
  last_run_at: string | null;
  last_status: string | null;
  last_message: string | null;
  next_expected_after: string | null;
}

export interface CronStatusState {
  loading: boolean;
  error: Error | null;
  status: JarvisCronStatus | null;
}

const REFRESH_MS = 60_000;
const JOB_NAME = "sita-briefings-daily-0600";

export function useCronStatus() {
  const [state, setState] = useState<CronStatusState>({
    loading: true,
    error: null,
    status: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const { data, error } = await supabase.rpc(
        "get_jarvis_cron_status" as never,
        { _jobname: JOB_NAME } as never,
      );
      if (error) throw error;
      const row = Array.isArray(data) && data.length > 0
        ? (data[0] as unknown as JarvisCronStatus)
        : null;
      setState({ loading: false, error: null, status: row });
    } catch (err) {
      setState({ loading: false, error: err as Error, status: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { ...state, refresh };
}