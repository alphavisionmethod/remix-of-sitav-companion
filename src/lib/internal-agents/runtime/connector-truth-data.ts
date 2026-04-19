// ═══════════════════════════════════════════════════════════════
// Connector Truth Data — typed loader for the AI Engineer panel.
// Uses canonical RPC get_connector_refresh_streak_summary() and the
// connector_refresh_nightly_runs table. Read-only.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export interface ConnectorStreakRow {
  provider: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_pass_at: string | null;
  last_fail_at: string | null;
  last_failure_class: string | null;
  streak_started_at: string | null;
  total_runs_7d: number;
  successful_runs_7d: number;
  last_run_id: string | null;
}

export interface ConnectorNightlyRunSummary {
  run_id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "pass" | "fail" | "degraded";
  providers_passed: string[];
  providers_failed: string[];
  expiry_pressure_passed: boolean;
  state_consistency_passed: boolean;
  failure_summary: string | null;
}

export interface ConnectorTruthSummary {
  streaks: ConnectorStreakRow[];
  recent_runs: ConnectorNightlyRunSummary[];
  reauth_required_count_24h: number;
  min_streak_days: number;
  classification: "green" | "yellow" | "red" | "building";
  generated_at: string;
}

export async function loadConnectorTruthSummary(): Promise<ConnectorTruthSummary | null> {
  const { data, error } = await supabase.rpc("get_connector_refresh_streak_summary");
  if (error) {
    console.warn("loadConnectorTruthSummary RPC failed", error);
    return null;
  }
  return data as unknown as ConnectorTruthSummary;
}
