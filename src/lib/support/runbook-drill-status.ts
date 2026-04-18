// ═══════════════════════════════════════════════════════════════
// SITA OS — Runbook Drill Status (Phase 28.D)
// Reads from `runbook_drill_results` and exposes the most recent
// drill per runbook so the admin Runbook Center shows real
// `lastTestedAt` data instead of the hardcoded null in the registry.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface RunbookDrillResult {
  id: string;
  runbookId: string;
  executedAt: string;
  mode: "dry-run" | "live";
  passed: boolean;
  durationMs: number | null;
  triggeredBy: "manual" | "scheduled" | "incident" | "ci";
  stepOutcomes: Array<{
    order: number;
    action: string;
    status: "ok" | "warn" | "fail" | "skipped";
    notes?: string;
    elapsedMs?: number;
  }>;
  notes: string | null;
}

export interface DrillSummary {
  runbookId: string;
  lastDrillAt: string | null;
  lastDrillPassed: boolean | null;
  drillsLast30Days: number;
  totalDrills: number;
}

function rowToResult(row: Record<string, any>): RunbookDrillResult {
  return {
    id: row.id,
    runbookId: row.runbook_id,
    executedAt: row.executed_at,
    mode: row.mode,
    passed: row.passed,
    durationMs: row.duration_ms,
    triggeredBy: row.triggered_by,
    stepOutcomes: Array.isArray(row.step_outcomes) ? row.step_outcomes : [],
    notes: row.notes,
  };
}

/** Fetch most recent drill (any mode) for a single runbook. */
export async function getLastDrillForRunbook(runbookId: string): Promise<RunbookDrillResult | null> {
  const { data, error } = await supabase
    .from("runbook_drill_results")
    .select("*")
    .eq("runbook_id", runbookId)
    .order("executed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToResult(data);
}

/** Drill summary across all runbooks (one row per runbook). */
export async function getDrillSummaries(): Promise<Record<string, DrillSummary>> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("runbook_drill_results")
    .select("runbook_id, executed_at, passed")
    .order("executed_at", { ascending: false })
    .limit(1000);
  if (error || !data) return {};
  const summary: Record<string, DrillSummary> = {};
  for (const row of data as Array<{ runbook_id: string; executed_at: string; passed: boolean }>) {
    const id = row.runbook_id;
    if (!summary[id]) {
      summary[id] = {
        runbookId: id,
        lastDrillAt: row.executed_at,
        lastDrillPassed: row.passed,
        drillsLast30Days: 0,
        totalDrills: 0,
      };
    }
    summary[id].totalDrills++;
    if (row.executed_at >= since) summary[id].drillsLast30Days++;
  }
  return summary;
}

/** Trigger a drill via the edge function. */
export async function triggerRunbookDrill(
  runbookId: string,
  opts?: { mode?: "dry-run" | "live"; triggeredBy?: "manual" | "scheduled" | "incident" | "ci" },
): Promise<{ ok: boolean; result?: RunbookDrillResult; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("runbook-drill", {
      body: {
        runbookId,
        mode: opts?.mode ?? "dry-run",
        triggeredBy: opts?.triggeredBy ?? "manual",
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data?.result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
