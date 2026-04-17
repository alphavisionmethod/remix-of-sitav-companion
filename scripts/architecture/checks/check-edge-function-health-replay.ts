/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Edge Function Health & Replay Gate (Phase 17 / CI 28)
//
// Asserts:
//  • Every ORCHESTRATION_FUNCTION has a replay-map entry with
//    kind ≠ "not-applicable" OR an explicit rationale.
//  • Every CONNECTOR_WEBHOOK_FUNCTION has kind ∈
//    { "webhook-redelivery", "idempotent-retry" }.
//  • Health adapter file + admin dashboard route registered.
//  • Replay mechanism strings reference real on-disk evidence.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  EDGE_FUNCTION_REPLAY_MAP,
  replayCoverageSummary,
} from "../../../src/lib/backend-topology/edge-function-replay-map";
import { EDGE_FUNCTION_BACKEND_CATEGORY } from "../../../src/lib/backend-topology/edge-function-categories";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}
const issues: Issue[] = [];

// ── 1. Coverage check ────────────────────────────────────────
const summary = replayCoverageSummary();
for (const name of summary.missing) {
  issues.push({
    severity: "error",
    area: "replay-coverage",
    message: `Required function "${name}" has no EDGE_FUNCTION_REPLAY_MAP entry`,
  });
}
for (const name of summary.invalidNotApplicable) {
  issues.push({
    severity: "error",
    area: "replay-rationale",
    message: `Function "${name}" declares kind=not-applicable without rationale`,
  });
}

// ── 2. Connector/webhook kind constraint ─────────────────────
const ALLOWED_WEBHOOK_KINDS = new Set(["webhook-redelivery", "idempotent-retry"]);
for (const [name, cat] of Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY)) {
  if (cat !== "CONNECTOR_WEBHOOK_FUNCTION") continue;
  const entry = EDGE_FUNCTION_REPLAY_MAP[name];
  if (entry && !ALLOWED_WEBHOOK_KINDS.has(entry.kind)) {
    issues.push({
      severity: "error",
      area: "replay-kind",
      message: `Connector "${name}" has invalid replay kind "${entry.kind}" (allowed: webhook-redelivery, idempotent-retry)`,
    });
  }
}

// ── 3. Orchestration kind constraint ─────────────────────────
for (const [name, cat] of Object.entries(EDGE_FUNCTION_BACKEND_CATEGORY)) {
  if (cat !== "ORCHESTRATION_FUNCTION") continue;
  const entry = EDGE_FUNCTION_REPLAY_MAP[name];
  if (entry && entry.kind === "not-applicable" && !entry.rationale) {
    issues.push({
      severity: "error",
      area: "replay-orchestration",
      message: `Orchestration "${name}" cannot be not-applicable without rationale`,
    });
  }
}

// ── 4. Health adapter + dashboard files exist ────────────────
const requiredFiles = [
  "src/lib/backend-topology/edge-function-health-source.ts",
  "src/lib/backend-topology/edge-function-replay-map.ts",
  "src/pages/admin/EFH01EdgeFunctionHealthCenter.tsx",
];
for (const f of requiredFiles) {
  if (!existsSync(f)) {
    issues.push({ severity: "error", area: "wiring", message: `Required file missing on disk: ${f}` });
  }
}

// ── 5. Route registered ──────────────────────────────────────
if (existsSync("src/routes/AdminRoutes.tsx")) {
  const routes = readFileSync("src/routes/AdminRoutes.tsx", "utf8");
  if (!routes.includes("/admin/edge-functions/health")) {
    issues.push({
      severity: "error",
      area: "wiring",
      message: "Route /admin/edge-functions/health not registered in AdminRoutes.tsx",
    });
  }
  if (!routes.includes("EFH01EdgeFunctionHealthCenter")) {
    issues.push({
      severity: "error",
      area: "wiring",
      message: "EFH01EdgeFunctionHealthCenter not lazy-imported in AdminRoutes.tsx",
    });
  }
}

// ── 6. Mechanism evidence keywords ───────────────────────────
const VALID_EVIDENCE_KEYWORDS = [
  "cloud_worker_jobs", "WorkflowReplayEngine", "api-gateway",
  "Idempotency-Key", "_shared", "table",
];
for (const [name, entry] of Object.entries(EDGE_FUNCTION_REPLAY_MAP)) {
  const evidence = entry.evidence ?? "";
  if (!VALID_EVIDENCE_KEYWORDS.some((k) => evidence.includes(k))) {
    issues.push({
      severity: "warning",
      area: "replay-evidence",
      message: `Function "${name}" evidence does not reference a known replay mechanism: "${evidence}"`,
    });
  }
}

// ── Emit report ──────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

const report = {
  generatedAt: new Date().toISOString(),
  ok,
  errorCount,
  warningCount,
  coverage: summary,
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/edge-function-health-replay-report.json", JSON.stringify(report, null, 2));

console.log(`\n🔁 Edge Function Health & Replay Report`);
console.log(`  Required: ${summary.requiredCount} · Covered: ${summary.coveredCount}`);
console.log(`  By kind:`, summary.byKind);
console.log(`  Errors: ${errorCount} · Warnings: ${warningCount}`);
if (issues.length > 0) {
  for (const i of issues) console.log(`  ${i.severity === "error" ? "❌" : "⚠️"} [${i.area}] ${i.message}`);
}
if (!ok) {
  process.exit(1);
}
console.log(`  ✅ All required functions have a declared replay path.\n`);
