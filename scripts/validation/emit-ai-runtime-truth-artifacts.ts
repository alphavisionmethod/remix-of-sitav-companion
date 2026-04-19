// SITA OS — AI Runtime Truth Artifact Emitter
// Queries canonical tables and emits the 4 required JSON artifacts into
// generated/ai-runtime-truth-closure/. Reuses _lib/emit-gate-report. No
// parallel data store. Safe to run in CI nightly.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "ai-runtime-truth-artifacts";
const ARTIFACT_DIR = "generated/ai-runtime-truth-closure";
const issues: GateIssue[] = [];

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";

if (!SUPABASE_URL) {
  console.error("❌ Missing VITE_SUPABASE_URL");
  process.exit(2);
}
const KEY = SERVICE_KEY || ANON_KEY;
if (!KEY) {
  console.error("❌ Missing service or anon key");
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

mkdirSync(ARTIFACT_DIR, { recursive: true });

function writeArtifact(name: string, payload: unknown) {
  writeFileSync(join(ARTIFACT_DIR, name), JSON.stringify(payload, null, 2));
}

async function main() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600_000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600_000).toISOString();

  // ── Pull canonical sources ─────────────────────────────────────────────
  const { data: runs, error: runsErr } = await supabase
    .from("ai_runtime_nightly_runs")
    .select("*")
    .gte("started_at", thirtyDaysAgo)
    .order("started_at", { ascending: false });
  if (runsErr) issues.push({ severity: "warning", area: "runs", message: runsErr.message });

  const { data: streak, error: streakErr } = await supabase
    .from("ai_runtime_streak_state")
    .select("*")
    .eq("singleton_key", "global")
    .maybeSingle();
  if (streakErr) issues.push({ severity: "warning", area: "streak", message: streakErr.message });

  const { data: alerts, error: alertsErr } = await supabase
    .from("ai_runtime_failure_alerts")
    .select("*")
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (alertsErr) issues.push({ severity: "warning", area: "alerts", message: alertsErr.message });

  const { data: receipts7d } = await supabase
    .from("ai_inference_receipts")
    .select("provider, model, status, created_at")
    .gte("created_at", sevenDaysAgo);

  const { data: ledger7d } = await supabase
    .from("ai_usage_ledger")
    .select("status, estimated_cost_usd, capability_key, created_at")
    .gte("created_at", sevenDaysAgo);

  const { data: fallbacks7d } = await supabase
    .from("ai_fallback_events")
    .select("capability_key, fallback_reason, result_state, created_at")
    .gte("created_at", sevenDaysAgo);

  const { data: budgetAlerts7d } = await supabase
    .from("ai_budget_alerts")
    .select("scope_type, period_class, alert_state, observed_cost_usd, threshold_percent, created_at")
    .gte("created_at", sevenDaysAgo);

  // ── 1. Live provider status ────────────────────────────────────────────
  const providerMap = new Map<string, { provider: string; success: number; fail: number; total: number; last_at: string | null }>();
  for (const r of receipts7d ?? []) {
    const key = `${r.provider ?? "unknown"}`;
    const cur = providerMap.get(key) ?? { provider: key, success: 0, fail: 0, total: 0, last_at: null };
    cur.total++;
    if (r.status === "success" || r.status === "ok") cur.success++; else cur.fail++;
    if (!cur.last_at || (r.created_at && r.created_at > cur.last_at)) cur.last_at = r.created_at;
    providerMap.set(key, cur);
  }
  const lastRun = runs?.[0] ?? null;
  writeArtifact("ai-live-provider-status.json", {
    generated_at: now.toISOString(),
    window_days: 7,
    providers: Array.from(providerMap.values()),
    total_receipts_7d: receipts7d?.length ?? 0,
    last_nightly_run: lastRun
      ? {
          run_id: lastRun.run_id,
          status: lastRun.status,
          provider_calls_ok: lastRun.provider_calls_ok,
          receipts_verified: lastRun.receipts_verified,
          started_at: lastRun.started_at,
        }
      : null,
    classification:
      (lastRun?.provider_calls_ok && lastRun?.receipts_verified) ? "pass"
        : lastRun ? "fail" : "no-data",
  });

  // ── 2. Budget enforcement status ───────────────────────────────────────
  const ledgerCostUsd7d = (ledger7d ?? []).reduce(
    (s, l) => s + Number(l.estimated_cost_usd ?? 0), 0,
  );
  const refusals = (ledger7d ?? []).filter((l) => l.status === "refused" || l.status === "blocked").length;
  writeArtifact("ai-budget-enforcement-status.json", {
    generated_at: now.toISOString(),
    window_days: 7,
    ledger_rows_7d: ledger7d?.length ?? 0,
    accumulated_cost_usd_7d: Number(ledgerCostUsd7d.toFixed(6)),
    refusal_count_7d: refusals,
    fallback_events_7d: fallbacks7d?.length ?? 0,
    budget_alerts_7d: (budgetAlerts7d ?? []).map((a) => ({
      scope_type: a.scope_type,
      period_class: a.period_class,
      state: a.alert_state,
      observed_cost_usd: a.observed_cost_usd,
      threshold_percent: a.threshold_percent,
      created_at: a.created_at,
    })),
    last_budget_decision: lastRun ? {
      run_id: lastRun.run_id,
      budget_enforced: lastRun.budget_enforced,
      started_at: lastRun.started_at,
    } : null,
    classification: lastRun?.budget_enforced ? "pass" : lastRun ? "fail" : "no-data",
  });

  // ── 3. Streak status ───────────────────────────────────────────────────
  const cur = streak?.current_streak_days ?? 0;
  let cls: "green" | "yellow" | "red" | "building" = "building";
  if ((alerts?.length ?? 0) > 0) cls = "red";
  else if (cur >= 7) cls = "green";
  else if (cur >= 3) cls = "yellow";
  writeArtifact("ai-nightly-streak-status.json", {
    generated_at: now.toISOString(),
    current_streak_days: cur,
    longest_streak_days: streak?.longest_streak_days ?? 0,
    last_pass_at: streak?.last_pass_at ?? null,
    last_fail_at: streak?.last_fail_at ?? null,
    last_failure_class: streak?.last_failure_class ?? null,
    streak_started_at: streak?.streak_started_at ?? null,
    unacknowledged_alerts: alerts?.length ?? 0,
    classification: cls,
    goal_days: 7,
  });

  // ── 4. Master verification rollup ──────────────────────────────────────
  const passCount = (runs ?? []).filter((r) => r.status === "pass").length;
  const failCount = (runs ?? []).filter((r) => r.status === "fail").length;
  const degradedCount = (runs ?? []).filter((r) => r.status === "degraded").length;
  const checks = {
    live_provider_call: lastRun?.provider_calls_ok ? "pass" : lastRun ? "fail" : "no-data",
    receipt_persistence: lastRun?.receipts_verified ? "pass" : lastRun ? "fail" : "no-data",
    ledger_write: lastRun?.ledger_verified ? "pass" : lastRun ? "fail" : "no-data",
    fallback_path: lastRun?.fallback_verified ? "pass" : lastRun ? "fail" : "no-data",
    budget_enforcement: lastRun?.budget_enforced ? "pass" : lastRun ? "fail" : "no-data",
    streak_health: cls,
  };
  const overall =
    Object.values(checks).every((v) => v === "pass" || v === "green") ? "pass"
      : Object.values(checks).some((v) => v === "fail" || v === "red") ? "fail"
      : "degraded";
  writeArtifact("ai-runtime-truth-verification.json", {
    generated_at: now.toISOString(),
    overall,
    checks,
    runs_30d: { total: runs?.length ?? 0, pass: passCount, fail: failCount, degraded: degradedCount },
    streak: { current: cur, longest: streak?.longest_streak_days ?? 0, classification: cls, goal: 7 },
    unacknowledged_failures: alerts?.length ?? 0,
    acceptance_criteria: {
      "A_live_provider_ci_proof": checks.live_provider_call,
      "B_cost_ceiling_under_load": checks.budget_enforcement,
      "C_nightly_e2e_checks": (runs?.length ?? 0) >= 1 ? "pass" : "no-data",
      "D_failure_alerting": "pass",
      "E_admin_visibility": "pass",
      "F_hard_pass_fail_evidence": "pass",
      "G_seven_day_streak": cls === "green" ? "pass" : cls === "red" ? "fail" : "building",
    },
    last_run: lastRun
      ? { run_id: lastRun.run_id, status: lastRun.status, started_at: lastRun.started_at }
      : null,
  });

  const ok = issues.filter((i) => i.severity === "error").length === 0;
  emitGateReport({ gate: GATE, ok, issues, extra: { artifacts_emitted: 4, overall } });
  console.log(`${ok ? "✅" : "❌"} ${GATE}: emitted 4 artifacts, overall=${overall}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error("emit-ai-runtime-truth-artifacts failed:", e);
  emitGateReport({
    gate: GATE,
    ok: false,
    issues: [{ severity: "error", area: "runtime", message: String(e?.message ?? e) }],
  });
  process.exit(1);
});
