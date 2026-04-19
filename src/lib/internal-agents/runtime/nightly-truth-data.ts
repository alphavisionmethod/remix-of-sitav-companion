// ═══════════════════════════════════════════════════════════════
// SITA OS — Nightly AI Runtime Truth Data Loader
//
// Single typed surface for AIRuntimeNightlyTruthPanel and the
// extended NightlyProofBadge. Reads from:
//   • ai_runtime_nightly_runs
//   • ai_runtime_streak_state
//   • ai_runtime_failure_alerts
//
// Admin RLS already enforces access; this module is read-only.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export interface NightlyRun {
  id: string;
  run_id: string;
  started_at: string;
  completed_at: string | null;
  status: "pass" | "fail" | "degraded" | "running";
  provider_calls_ok: boolean;
  receipts_verified: boolean;
  ledger_verified: boolean;
  fallback_verified: boolean;
  budget_enforced: boolean;
  failure_class: string | null;
  failure_detail: string | null;
  total_invocations: number;
  estimated_cost_usd: number;
  evidence: Record<string, unknown>;
  triggered_by: string;
  created_at: string;
}

export interface StreakState {
  current_streak_days: number;
  longest_streak_days: number;
  streak_started_at: string | null;
  last_pass_at: string | null;
  last_fail_at: string | null;
  last_failure_class: string | null;
  last_run_id: string | null;
  unacknowledged_failures: number;
  classification: "green" | "yellow" | "building" | "red";
  recent_runs: Array<{
    run_id: string;
    status: string;
    started_at: string;
    failure_class: string | null;
    provider_calls_ok: boolean;
    receipts_verified: boolean;
    ledger_verified: boolean;
    fallback_verified: boolean;
    budget_enforced: boolean;
  }>;
  generated_at: string;
}

export interface FailureAlert {
  id: string;
  run_id: string;
  failure_class: string;
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  evidence: Record<string, unknown>;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  acknowledgment_notes: string | null;
  created_at: string;
}

export interface NightlyTruthData {
  streak: StreakState | null;
  recentRuns: NightlyRun[];
  unackAlerts: FailureAlert[];
}

export async function loadNightlyTruthData(): Promise<NightlyTruthData> {
  const [streakRes, runsRes, alertsRes] = await Promise.all([
    supabase.rpc("get_ai_runtime_streak_summary"),
    supabase
      .from("ai_runtime_nightly_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30),
    supabase
      .from("ai_runtime_failure_alerts")
      .select("*")
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    streak: (streakRes.data as unknown as StreakState | null) ?? null,
    recentRuns: (runsRes.data as unknown as NightlyRun[] | null) ?? [],
    unackAlerts: (alertsRes.data as unknown as FailureAlert[] | null) ?? [],
  };
}

export async function acknowledgeAlert(alertId: string, notes?: string): Promise<{ ok: boolean; reason?: string }> {
  const { data, error } = await supabase.rpc("acknowledge_ai_runtime_failure_alert", {
    _alert_id: alertId,
    _notes: notes ?? null,
  });
  if (error) return { ok: false, reason: error.message };
  return (data as unknown as { ok: boolean; reason?: string }) ?? { ok: false, reason: "unknown" };
}

export async function triggerManualVerification(): Promise<{ ok: boolean; run_id?: string; status?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("ai-runtime-nightly-verify", {
    body: { triggered_by: "manual" },
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; run_id?: string; status?: string };
}
