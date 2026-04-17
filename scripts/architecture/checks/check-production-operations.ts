/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate 31 — Production Operations Reality (Phase 20)
// Verifies the four pillars are wired end-to-end:
//   A1 Error monitoring (Sentry + native error_events sink)
//   A2 APM tracing (request-context, withTrace on hot fns)
//   A3 Uptime (real probes, heartbeat, cron)
//   A4 Alert routing (alerts table, ingest+route+actions, no DEMO_ALERTS)
// Emits generated/production-operations-report.json
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

interface Issue {
  severity: "error" | "warning";
  pillar: "A1" | "A2" | "A3" | "A4" | "wiring";
  message: string;
}

const issues: Issue[] = [];
const evidence: Record<string, unknown> = {};

function fileExists(path: string): boolean {
  return existsSync(path);
}
function fileContains(path: string, needle: string | RegExp): boolean {
  if (!existsSync(path)) return false;
  const text = readFileSync(path, "utf-8");
  return typeof needle === "string" ? text.includes(needle) : needle.test(text);
}

// ── A1: Error monitoring ─────────────────────────────────────────
const sentryFile = "src/lib/observability/sentry.ts";
const errorIngest = "supabase/functions/error-ingest/index.ts";
const errorService = "src/lib/services/error-monitoring-service.ts";
const mainTsx = "src/main.tsx";

if (!fileExists(sentryFile)) issues.push({ severity: "error", pillar: "A1", message: "missing src/lib/observability/sentry.ts" });
if (!fileExists(errorIngest)) issues.push({ severity: "error", pillar: "A1", message: "missing supabase/functions/error-ingest/index.ts" });
if (!fileContains(mainTsx, "initSentry()")) issues.push({ severity: "error", pillar: "A1", message: "main.tsx does not call initSentry()" });
if (!fileContains(mainTsx, "initErrorMonitoring()")) issues.push({ severity: "error", pillar: "A1", message: "main.tsx does not call initErrorMonitoring()" });
if (!fileContains(errorService, /error-ingest/)) issues.push({ severity: "error", pillar: "A1", message: "error-monitoring-service does not post to error-ingest" });

evidence.A1_error_monitoring = {
  sentry_init_present: fileExists(sentryFile),
  sentry_init_called: fileContains(mainTsx, "initSentry()"),
  native_error_ingest_present: fileExists(errorIngest),
  error_service_targets_ingest: fileContains(errorService, /error-ingest/),
  error_explorer_present: fileExists("src/pages/admin/ErrorEventsExplorer.tsx"),
};

// ── A2: APM / tracing ────────────────────────────────────────────
const reqCtx = "src/lib/observability/request-context.ts";
const apm = "src/lib/observability/apm.ts";
const traceShared = "supabase/functions/_shared/tracing.ts";
const traceIngest = "supabase/functions/trace-ingest/index.ts";
const HOT_FNS = [
  "supabase/functions/agent-executor/index.ts",
  "supabase/functions/admin-bff-gateway/index.ts",
  "supabase/functions/user-bff-gateway/index.ts",
  "supabase/functions/ai-gateway/index.ts",
  "supabase/functions/payment-process/index.ts",
  "supabase/functions/connector-proxy/index.ts",
];

if (!fileExists(reqCtx)) issues.push({ severity: "error", pillar: "A2", message: "missing request-context.ts" });
if (!fileExists(apm)) issues.push({ severity: "error", pillar: "A2", message: "missing apm.ts" });
if (!fileExists(traceShared)) issues.push({ severity: "error", pillar: "A2", message: "missing _shared/tracing.ts" });
if (!fileExists(traceIngest)) issues.push({ severity: "error", pillar: "A2", message: "missing trace-ingest fn" });
if (!fileContains(mainTsx, "installFetchInterceptor()")) issues.push({ severity: "error", pillar: "A2", message: "main.tsx does not install fetch interceptor" });
if (!fileContains(mainTsx, "startSpanExporter()")) issues.push({ severity: "error", pillar: "A2", message: "main.tsx does not start span exporter" });

const wrappedFns = HOT_FNS.filter((p) => fileContains(p, /withTrace\s*\(/));
if (wrappedFns.length < 6) {
  const missing = HOT_FNS.filter((p) => !fileContains(p, /withTrace\s*\(/));
  issues.push({ severity: "error", pillar: "A2", message: `only ${wrappedFns.length}/6 hot edge fns wrapped with withTrace; missing: ${missing.join(", ")}` });
}

evidence.A2_apm_tracing = {
  request_context_present: fileExists(reqCtx),
  apm_present: fileExists(apm),
  trace_shared_present: fileExists(traceShared),
  trace_ingest_present: fileExists(traceIngest),
  fetch_interceptor_installed: fileContains(mainTsx, "installFetchInterceptor()"),
  span_exporter_started: fileContains(mainTsx, "startSpanExporter()"),
  hot_fns_wrapped: wrappedFns.length,
  hot_fns_total: HOT_FNS.length,
  wrapped: wrappedFns,
};

// ── A3: Uptime ───────────────────────────────────────────────────
const healthCheck = "supabase/functions/health-check/index.ts";
const healthReady = "supabase/functions/health-ready/index.ts";
const healthLive = "supabase/functions/health-live/index.ts";
const healthBeat = "supabase/functions/health-beat/index.ts";
const healthCron = "supabase/functions/health-cron/index.ts";
const uptimeLib = "src/lib/observability/uptime.ts";

if (!fileExists(healthCheck) || !fileContains(healthCheck, "probeDb")) issues.push({ severity: "error", pillar: "A3", message: "health-check missing real probes" });
if (!fileExists(healthReady)) issues.push({ severity: "error", pillar: "A3", message: "missing health-ready" });
if (!fileExists(healthLive)) issues.push({ severity: "error", pillar: "A3", message: "missing health-live" });
if (!fileExists(healthBeat)) issues.push({ severity: "error", pillar: "A3", message: "missing health-beat" });
if (!fileExists(healthCron)) issues.push({ severity: "error", pillar: "A3", message: "missing health-cron" });
if (!fileExists(uptimeLib)) issues.push({ severity: "error", pillar: "A3", message: "missing uptime.ts" });
if (!fileContains(mainTsx, "startUptimeHeartbeat()")) issues.push({ severity: "error", pillar: "A3", message: "uptime heartbeat not started in main.tsx" });

evidence.A3_uptime = {
  health_check_real_probes: fileContains(healthCheck, "probeDb"),
  ready_present: fileExists(healthReady),
  live_present: fileExists(healthLive),
  beat_present: fileExists(healthBeat),
  cron_present: fileExists(healthCron),
  uptime_lib_present: fileExists(uptimeLib),
  client_heartbeat_started: fileContains(mainTsx, "startUptimeHeartbeat()"),
};

// ── A4: Alert routing ────────────────────────────────────────────
const alertIngest = "supabase/functions/alert-ingest/index.ts";
const alertRoute = "supabase/functions/alert-route/index.ts";
const alertActions = "supabase/functions/alert-actions/index.ts";
const alertClient = "src/lib/services/alerting/alert-client.ts";
const triageBoard = "src/pages/admin/AlertTriageBoard.tsx";

if (!fileExists(alertIngest)) issues.push({ severity: "error", pillar: "A4", message: "missing alert-ingest fn" });
if (!fileExists(alertRoute)) issues.push({ severity: "error", pillar: "A4", message: "missing alert-route fn" });
if (!fileExists(alertActions)) issues.push({ severity: "error", pillar: "A4", message: "missing alert-actions fn" });
if (!fileExists(alertClient)) issues.push({ severity: "error", pillar: "A4", message: "missing alert-client" });
if (fileContains(triageBoard, "DEMO_ALERTS")) issues.push({ severity: "error", pillar: "A4", message: "AlertTriageBoard still imports DEMO_ALERTS" });
if (!fileContains(triageBoard, /from\s+["']@\/integrations\/supabase\/client["']/)) {
  issues.push({ severity: "error", pillar: "A4", message: "AlertTriageBoard not wired to live supabase client" });
}

evidence.A4_alert_routing = {
  ingest_present: fileExists(alertIngest),
  route_present: fileExists(alertRoute),
  actions_present: fileExists(alertActions),
  client_present: fileExists(alertClient),
  triage_board_demo_free: !fileContains(triageBoard, "DEMO_ALERTS"),
  triage_board_live_wired: fileContains(triageBoard, /from\s+["']@\/integrations\/supabase\/client["']/),
};

// ── Summary ──────────────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "production-operations",
  phase: "phase-20-production-operations",
  ok,
  errorCount,
  warningCount,
  issues,
  evidence,
};

const out = "generated/production-operations-report.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2), "utf-8");

console.log(`Production Operations: A1=${evidence.A1_error_monitoring ? "✓" : "✗"} A2=${(evidence.A2_apm_tracing as { hot_fns_wrapped: number }).hot_fns_wrapped}/6 A3=ok A4=ok`);
console.log(`  errors: ${errorCount}, warnings: ${warningCount}`);
console.log(`  → ${out}`);

if (!ok) {
  console.error("❌ Issues:");
  for (const i of issues) console.error(`   - [${i.severity}] ${i.pillar}: ${i.message}`);
  process.exit(1);
}
console.log("✅ Pass");
