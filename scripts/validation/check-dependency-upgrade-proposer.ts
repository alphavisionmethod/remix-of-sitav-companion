// SITA OS — Phase 3 BLOCK gate: dependency upgrade proposer wired to suggestion pipeline
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "dependency-upgrade-proposer";
const issues: GateIssue[] = [];

const FN = "supabase/functions/internal-agent-dependency-scanner/index.ts";
const PAGE = "src/pages/admin/ai-runtime/DependencyFindingsBoard.tsx";
const RUNBOOK = "docs/runbooks/dependency-upgrade-proposer.md";
const ROUTES = "src/routes/AdminRoutes.tsx";
const HUB = "src/pages/admin/ai-runtime/AIRuntimeHome.tsx";

for (const f of [FN, PAGE, RUNBOOK, ROUTES, HUB]) {
  if (!existsSync(f)) issues.push({ severity: "error", area: "files", message: `missing: ${f}` });
}

if (existsSync(FN)) {
  const src = readFileSync(FN, "utf8");
  for (const tok of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "dependency_upgrade_findings",
    "propose_implementation_suggestion",
    "dependency_upgrade",
    "advisory_id",
    "normalizeNpmAudit",
  ]) {
    if (!src.includes(tok)) issues.push({ severity: "error", area: "wiring", message: `scanner missing: ${tok}` });
  }
  // Must refuse fake/sample input
  if (!/no\s+real\s+input|REAL\s+INPUT|refus(e|ing)/i.test(src)) {
    issues.push({ severity: "error", area: "fake-content", message: "scanner must refuse to run without real input" });
  }
}

if (existsSync(PAGE)) {
  const src = readFileSync(PAGE, "utf8");
  if (!src.includes("dependency_upgrade_findings")) issues.push({ severity: "error", area: "page", message: "page must read findings table" });
  if (!src.includes("/admin/ai-runtime/suggestions")) issues.push({ severity: "error", area: "page", message: "page must link findings to suggestions" });
}

if (existsSync(ROUTES) && !readFileSync(ROUTES, "utf8").includes("/admin/ai-runtime/dependency-findings")) {
  issues.push({ severity: "error", area: "route", message: "/admin/ai-runtime/dependency-findings not registered" });
}

if (existsSync(HUB) && !readFileSync(HUB, "utf8").includes('id: "dependency-findings"')) {
  issues.push({ severity: "error", area: "hub", message: "AIRuntimeHome missing dependency-findings module" });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({ gate: GATE, ok, issues });
process.exit(ok ? 0 : 1);
