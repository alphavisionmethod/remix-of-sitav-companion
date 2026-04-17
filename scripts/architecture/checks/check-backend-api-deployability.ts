/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Backend / API Deployability Contract Gate (Phase 16)
//
// Asserts the 15-item Backend / API Reality Checklist against
// disk truth: registry integrity, classification ambiguity,
// governance health, frontend-action coverage, policy envelope
// for high-risk functions.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import {
  BACKEND_API_DEPLOYABILITY_READINESS,
  backendApiReadinessSummary,
} from "../../../src/lib/runtime/backend/release/backend-api-deployability-readiness";
import { EDGE_FUNCTION_REGISTRY } from "../../../src/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_AUTH_MAP } from "../../../src/lib/backend-topology/edge-function-auth-map";
import { EDGE_FUNCTION_CONTRACT_MAP } from "../../../src/lib/backend-topology/edge-function-contract-map";
import { EDGE_FUNCTION_OWNER_MAP } from "../../../src/lib/backend-topology/edge-function-owner-map";
import {
  EDGE_FUNCTION_POLICY_MAP,
  EDGE_FUNCTION_POLICY_INDEX,
  policyCoverageSummary,
} from "../../../src/lib/backend-topology/edge-function-policy-map";
import {
  FRONTEND_ACTION_API_MAP,
  frontendActionCoverageSummary,
} from "../../../src/lib/backend-topology/frontend-action-api-map";

interface BackendIssue {
  severity: "error" | "warning";
  area: string;
  message: string;
}
const issues: BackendIssue[] = [];

// ── 1. Registry integrity ──────────────────────────────────────
let missingCount = 0;
for (const item of BACKEND_API_DEPLOYABILITY_READINESS) {
  if (item.status === "missing") {
    missingCount++;
    issues.push({ severity: "error", area: "registry", message: `Item "${item.id}" is MISSING` });
  }
  if (item.status === "partial" && !item.remediation) {
    issues.push({ severity: "error", area: "registry", message: `Partial item "${item.id}" lacks remediation` });
  }
  if (item.blocker && item.status !== "ready" && item.status !== "partial") {
    issues.push({ severity: "error", area: "registry", message: `Blocker "${item.id}" not ready (status=${item.status})` });
  }
}

// ── 2. Membership report green ─────────────────────────────────
const membershipPath = "generated/edge-function-membership-report.json";
if (existsSync(membershipPath)) {
  try {
    const m = JSON.parse(readFileSync(membershipPath, "utf8"));
    if (m.ok !== true) issues.push({ severity: "error", area: "membership", message: `membership report ok=${m.ok}` });
    if ((m.orphans?.length ?? 0) > 0) issues.push({ severity: "error", area: "membership", message: `${m.orphans.length} orphan function(s)` });
    if ((m.ghosts?.length ?? 0) > 0) issues.push({ severity: "error", area: "membership", message: `${m.ghosts.length} ghost function(s)` });
  } catch {
    issues.push({ severity: "warning", area: "membership", message: `Could not parse ${membershipPath}` });
  }
} else {
  issues.push({ severity: "warning", area: "membership", message: `${membershipPath} missing — run gen first` });
}

// ── 3. Governance not RED ──────────────────────────────────────
const govPath = "generated/edge-function-governance-report.json";
if (existsSync(govPath)) {
  try {
    const g = JSON.parse(readFileSync(govPath, "utf8"));
    if (g.summary?.overallStatus === "RED") {
      issues.push({ severity: "error", area: "governance", message: `governance overallStatus=RED (${g.summary?.failed} failed)` });
    }
    const claimedTotal = g.totalFunctions ?? 0;
    if (claimedTotal !== EDGE_FUNCTION_REGISTRY.length) {
      issues.push({
        severity: "warning",
        area: "governance",
        message: `governance.totalFunctions=${claimedTotal} but registry has ${EDGE_FUNCTION_REGISTRY.length}`,
      });
    }
  } catch {
    issues.push({ severity: "warning", area: "governance", message: `Could not parse ${govPath}` });
  }
}

// ── 4. Classification ambiguity (active, non-wrapper) ──────────
const classPath = "generated/edge-function-classification-audit.json";
let activeAmbiguous = 0;
if (existsSync(classPath)) {
  try {
    const c = JSON.parse(readFileSync(classPath, "utf8"));
    const targets: Array<{ name: string; category: string; ambiguityFlags?: string[] }> =
      c.highRiskTargets ?? [];
    const activeNames = new Set(
      EDGE_FUNCTION_REGISTRY.filter((e) => e.status === "active" && e.migrationStatus !== "wrapper")
        .map((e) => e.name),
    );
    for (const t of targets) {
      if ((t.ambiguityFlags?.length ?? 0) > 0 && activeNames.has(t.name)) {
        activeAmbiguous++;
        issues.push({
          severity: "error",
          area: "classification",
          message: `Active non-wrapper "${t.name}" still ambiguous: ${t.ambiguityFlags!.join(",")}`,
        });
      }
    }
  } catch {
    issues.push({ severity: "warning", area: "classification", message: `Could not parse ${classPath}` });
  }
}

// ── 5. Per-function metadata coverage ──────────────────────────
const authNames = new Set(Object.keys(EDGE_FUNCTION_AUTH_MAP));
const contractNames = new Set(Object.keys(EDGE_FUNCTION_CONTRACT_MAP));
const ownerNames = new Set(Object.keys(EDGE_FUNCTION_OWNER_MAP));
let metadataGaps = 0;
for (const fn of EDGE_FUNCTION_REGISTRY) {
  if (fn.status !== "active") continue;
  if (!authNames.has(fn.name)) { issues.push({ severity: "error", area: "metadata", message: `${fn.name} missing auth entry` }); metadataGaps++; }
  if (!contractNames.has(fn.name)) { issues.push({ severity: "error", area: "metadata", message: `${fn.name} missing contract entry` }); metadataGaps++; }
  if (!ownerNames.has(fn.name)) { issues.push({ severity: "error", area: "metadata", message: `${fn.name} missing owner entry` }); metadataGaps++; }
}

// ── 6. Policy envelope on high-risk functions ──────────────────
let policyGaps = 0;
for (const fn of EDGE_FUNCTION_REGISTRY) {
  if (fn.status !== "active") continue;
  const policy = EDGE_FUNCTION_POLICY_INDEX.get(fn.name);
  if (!policy) {
    issues.push({ severity: "error", area: "policy", message: `${fn.name} missing policy entry` });
    policyGaps++;
    continue;
  }
  if (fn.sideEffectClass === "high") {
    if (policy.rateLimit === "none") {
      issues.push({ severity: "error", area: "policy", message: `${fn.name} sideEffect=high but rateLimit=none` });
      policyGaps++;
    }
    if (policy.auditLog !== "required") {
      issues.push({ severity: "error", area: "policy", message: `${fn.name} sideEffect=high but auditLog=${policy.auditLog}` });
      policyGaps++;
    }
  }
}

// ── 7. Frontend-action targets resolve ─────────────────────────
const fnNames = new Set(EDGE_FUNCTION_REGISTRY.map((e) => e.name));
let unresolvedActions = 0;
for (const action of FRONTEND_ACTION_API_MAP) {
  if (action.kind === "edge-function") {
    if (!fnNames.has(action.target)) {
      issues.push({
        severity: action.criticality === "P0" ? "error" : "warning",
        area: "action-map",
        message: `Action "${action.id}" targets unknown edge function "${action.target}"`,
      });
      unresolvedActions++;
    }
  }
}

// ── Write report ───────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const summary = backendApiReadinessSummary();
const policy = policyCoverageSummary();
const actions = frontendActionCoverageSummary();

const report = {
  generatedAt: new Date().toISOString(),
  phase: "phase-16-backend-api-deployability",
  ok: errorCount === 0 && summary.ok,
  errorCount,
  warningCount,
  ready: summary.ready,
  partial: summary.partial,
  deferred: summary.deferred,
  missing: summary.missing,
  total: summary.total,
  metrics: {
    edgeFunctionsTotal: EDGE_FUNCTION_REGISTRY.length,
    activeAmbiguousCount: activeAmbiguous,
    metadataGaps,
    policyGaps,
    unresolvedActions,
    frontendActions: actions,
    policyCoverage: policy,
  },
  items: BACKEND_API_DEPLOYABILITY_READINESS,
  issues,
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/backend-api-deployability-report.json", JSON.stringify(report, null, 2));

console.log(`📊 Backend/API deployability: ${summary.ready}/${summary.total} ready, ${summary.partial} partial, ${summary.missing} missing`);
console.log(`   active-ambiguous=${activeAmbiguous}, metadata-gaps=${metadataGaps}, policy-gaps=${policyGaps}, unresolved-actions=${unresolvedActions}`);
console.log(`   errors=${errorCount}, warnings=${warningCount}`);

if (errorCount > 0) {
  for (const i of issues.filter((x) => x.severity === "error")) console.error(`  ❌ [${i.area}] ${i.message}`);
  process.exit(1);
}
console.log("✅ Backend/API deployability gate passed");
