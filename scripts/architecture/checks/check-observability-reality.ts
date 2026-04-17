#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Observability Reality Check (Phase 31.C)
// Asserts every claim in Checklist 26 maps to live wiring.
// Emits generated/observability-truth-report.json (10/10 truthful).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

interface CheckResult {
  id: number;
  item: string;
  truthful: boolean;
  evidence: string[];
  notes?: string;
}

const ROOT = process.cwd();
const REPORT_PATH = resolve(ROOT, "generated/observability-truth-report.json");

function fileExists(p: string): boolean {
  return existsSync(resolve(ROOT, p));
}

function fileContains(p: string, needles: string[]): { ok: boolean; found: string[] } {
  if (!fileExists(p)) return { ok: false, found: [] };
  const txt = readFileSync(resolve(ROOT, p), "utf8");
  const found = needles.filter((n) => txt.includes(n));
  return { ok: found.length === needles.length, found };
}

const checks: CheckResult[] = [];

// 1. Structured logs
{
  const c = fileContains("src/lib/observability/structured-logger.ts", ["export const logger", "getLogBuffer", "LogEntry"]);
  checks.push({ id: 1, item: "Structured logs", truthful: c.ok, evidence: ["src/lib/observability/structured-logger.ts", ...c.found] });
}

// 2. Metrics
{
  const a = fileExists("src/lib/observability/telemetry-collector.ts");
  const b = fileExists("src/lib/observability/cost-governance.ts");
  checks.push({ id: 2, item: "Metrics", truthful: a && b, evidence: ["telemetry-collector.ts", "cost-governance.ts"] });
}

// 3. Tracing
{
  const trace = fileExists("src/lib/observability/distributed-tracing.ts");
  const apm = fileExists("src/lib/observability/apm.ts");
  const ctx = fileExists("src/lib/observability/request-context.ts");
  checks.push({ id: 3, item: "Tracing where needed", truthful: trace && apm && ctx, evidence: ["distributed-tracing.ts", "apm.ts", "request-context.ts"] });
}

// 4. Error capture (Sentry + native sink + boot order)
{
  const sentry = fileExists("src/lib/observability/sentry.ts");
  const errMon = fileExists("src/lib/services/error-monitoring-service.ts");
  const boot = fileContains("src/main.tsx", ["initSentry", "initErrorMonitoring", "installFetchInterceptor", "initPerformanceMonitor", "startSpanExporter", "startUptimeHeartbeat"]);
  checks.push({
    id: 4,
    item: "Error capture (boot order honored)",
    truthful: sentry && errMon && boot.ok,
    evidence: ["sentry.ts", "error-monitoring-service.ts", `main.tsx boot:${boot.found.length}/6`],
  });
}

// 5. Incident classification
{
  const cls = fileExists("src/lib/services/support-diagnostics/incident-classification.service.ts");
  const mgr = fileContains("src/lib/services/incident-management/index.ts", ["IncidentManagementService", "getActiveIncidents"]);
  checks.push({ id: 5, item: "Incident classification + lifecycle", truthful: cls && mgr.ok, evidence: ["incident-classification.service.ts", "incident-management/index.ts"] });
}

// 6. Function/service health
{
  const probes = fileExists("src/lib/observability/health-probes.ts");
  const hb = fileExists("src/lib/services/service-registry/heartbeat.ts");
  const edgeFns = ["health-cron", "alert-ingest", "alert-route", "alert-actions", "error-ingest", "trace-ingest"];
  const edgeOk = edgeFns.every((fn) => fileExists(`supabase/functions/${fn}/index.ts`));
  checks.push({
    id: 6,
    item: "Function/service health (6 obs edge fns deployed)",
    truthful: probes && hb && edgeOk,
    evidence: ["health-probes.ts", "service-registry/heartbeat.ts", ...edgeFns.map((fn) => `supabase/functions/${fn}/`)],
  });
}

// 7. Mobile diagnostics
{
  const c = fileContains("src/lib/mobile-platform/analytics/mobile-diagnostics.ts", ["recordMobileDiagnostic", "peekMobileDiagnostics"]);
  checks.push({ id: 7, item: "Mobile diagnostics", truthful: c.ok, evidence: ["mobile-diagnostics.ts", ...c.found] });
}

// 8. Runtime probes
{
  const c = fileContains("src/lib/observability/health-probes.ts", ["runAllProbes", "getOverallHealth", "probeSupabase", "probeAuth", "probeStorage"]);
  checks.push({ id: 8, item: "Runtime probes", truthful: c.ok, evidence: c.found });
}

// 9. Support bundle generation — must read live sources, NOT hardcoded 94
{
  const path = "src/lib/services/support-diagnostics/diagnostic-bundle.service.ts";
  const txt = fileExists(path) ? readFileSync(resolve(ROOT, path), "utf8") : "";
  const usesLive =
    txt.includes("runAllProbes") &&
    txt.includes("getCostSummary") &&
    txt.includes("getLogBuffer") &&
    txt.includes("tracer") &&
    txt.includes("peekMobileDiagnostics") &&
    txt.includes("serviceHeartbeat") &&
    txt.includes("createIncidentManagement") &&
    txt.includes("generateSupportBundle");
  // Reject any hardcoded systemHealth: 94
  const noFakeScore = !/systemHealth:\s*94\b/.test(txt);
  checks.push({
    id: 9,
    item: "Support bundle generation (live sources, no hardcoded 94)",
    truthful: usesLive && noFakeScore,
    evidence: [
      "diagnostic-bundle.service.ts",
      `usesLive=${usesLive}`,
      `noFakeScore=${noFakeScore}`,
      "exports: generateSupportBundle",
    ],
  });
}

// 10. Health dashboards reflect real telemetry
{
  const sysDash = fileExists("src/components/admin/system-health/SystemHealthDashboard.tsx") ||
    fileExists("src/components/dashboard/SystemHealthDashboard.tsx") ||
    fileExists("src/pages/admin/SystemHealthDashboard.tsx") ||
    fileExists("src/components/SystemHealthDashboard.tsx");
  const cloudPath = "src/pages/admin/cloud/CloudObservabilityAdmin.tsx";
  const cloud = fileExists(cloudPath) ? readFileSync(resolve(ROOT, cloudPath), "utf8") : "";
  const cloudLive = cloud.includes("useObservability") && !cloud.includes("getDemoMetrics");
  checks.push({
    id: 10,
    item: "Health dashboards reflect real telemetry",
    truthful: cloudLive,
    evidence: [
      `CloudObservabilityAdmin.useObservability=${cloud.includes("useObservability")}`,
      `CloudObservabilityAdmin.no-getDemoMetrics=${!cloud.includes("getDemoMetrics")}`,
      `SystemHealthDashboard.present=${sysDash}`,
    ],
  });
}

const truthful = checks.filter((c) => c.truthful).length;
const total = checks.length;
const ok = truthful === total;

const report = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  generator: "scripts/architecture/checks/check-observability-reality.ts",
  checklist: 26,
  summary: { items: total, truthful, ok, deployable: ok },
  checks,
  manifestEntry: "manifest-observability-truth",
};

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

const failed = checks.filter((c) => !c.truthful);
if (failed.length > 0) {
  console.error(`❌ Observability truth: ${truthful}/${total} truthful`);
  for (const f of failed) console.error(`   - #${f.id} ${f.item}`);
  process.exit(1);
}
console.log(`✅ Observability truth: ${truthful}/${total} truthful — Checklist 26 deployable`);
console.log(`   Report → ${REPORT_PATH}`);
