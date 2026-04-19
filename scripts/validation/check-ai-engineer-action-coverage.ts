/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub: Operator Action Coverage Gate
// Tier: BLOCK
//
// For every tab marked `requiresOperatorAction: true` in the registry,
// asserts the panel actually composes <OperatorActionPanel ... /> in
// at least one branch (typically the empty / error / degraded state).
//
// This gate is stricter than primitive-coverage: it requires real JSX
// usage of the primitive, not just an import.
//
// Emits: generated/ai-engineer-action-coverage-report.json
//        + generated/admin-ai-engineer-team/action-coverage.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { AI_ENGINEER_HUB_TABS } from "../../src/lib/admin/ai-engineer-hub/tab-registry";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const ROOT = resolve(process.cwd());
const OUT_DIR = resolve(ROOT, "generated/admin-ai-engineer-team");
mkdirSync(OUT_DIR, { recursive: true });

function aliasToPath(alias: string): string {
  return resolve(ROOT, `${alias.replace(/^@\//, "src/")}.tsx`);
}

interface PanelActionCoverage {
  tabId: string;
  componentPath: string;
  requiresOperatorAction: boolean;
  fileExists: boolean;
  importsOperatorActionPanel: boolean;
  composesOperatorActionPanel: boolean;
  ok: boolean;
}

const issues: GateIssue[] = [];
const coverage: PanelActionCoverage[] = [];

for (const t of AI_ENGINEER_HUB_TABS) {
  const p = aliasToPath(t.componentPath);
  const exists = existsSync(p);
  if (!exists) {
    coverage.push({
      tabId: t.id,
      componentPath: t.componentPath,
      requiresOperatorAction: t.requiresOperatorAction,
      fileExists: false,
      importsOperatorActionPanel: false,
      composesOperatorActionPanel: false,
      ok: !t.requiresOperatorAction,
    });
    if (t.requiresOperatorAction) {
      issues.push({
        severity: "warning",
        area: "missing-file",
        message: `Tab "${t.id}" requires operator actions but file missing: ${t.componentPath}`,
      });
    }
    continue;
  }
  const src = readFileSync(p, "utf8");
  const importsOperatorActionPanel =
    /from\s+["'`]@\/components\/primitives\/actions\/OperatorActionPanel["'`]/.test(src) ||
    /from\s+["'`]@\/components\/primitives\/actions["'`]/.test(src);
  const composesOperatorActionPanel = /<OperatorActionPanel(\s|>|\/)/.test(src);

  const tabOk = !t.requiresOperatorAction || (importsOperatorActionPanel && composesOperatorActionPanel);

  coverage.push({
    tabId: t.id,
    componentPath: t.componentPath,
    requiresOperatorAction: t.requiresOperatorAction,
    fileExists: true,
    importsOperatorActionPanel,
    composesOperatorActionPanel,
    ok: tabOk,
  });

  if (t.requiresOperatorAction && !composesOperatorActionPanel) {
    issues.push({
      severity: "warning",
      area: "operator-action-missing",
      message: `Tab "${t.id}" requires operator actions but does not render <OperatorActionPanel/> anywhere in ${t.componentPath}`,
    });
  }
}

const requiringTabs = coverage.filter((c) => c.requiresOperatorAction);
const compliantTabs = requiringTabs.filter((c) => c.composesOperatorActionPanel);

writeFileSync(
  join(OUT_DIR, "action-coverage.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalTabs: AI_ENGINEER_HUB_TABS.length,
      requiringOperatorAction: requiringTabs.length,
      compliantTabs: compliantTabs.length,
      coveragePct: requiringTabs.length === 0 ? 100 : Math.round((compliantTabs.length / requiringTabs.length) * 100),
      panels: coverage,
    },
    null,
    2,
  ),
);

const errCount = issues.filter((i) => i.severity === "error").length;
const ok = errCount === 0;

const file = emitGateReport({
  gate: "ai-engineer-action-coverage",
  ok,
  issues,
  extra: {
    tier: "WARN",
    promotionTier: "BLOCK",
    scope: "admin-ai-engineer-team",
    requiringOperatorAction: requiringTabs.length,
    compliantTabs: compliantTabs.length,
    coveragePct: requiringTabs.length === 0 ? 100 : Math.round((compliantTabs.length / requiringTabs.length) * 100),
  },
});

console.log(
  `[ai-engineer-action-coverage] ${ok ? "OK" : "FAIL"} — ${compliantTabs.length}/${requiringTabs.length} required tabs render <OperatorActionPanel/>, ${errCount} errors → ${file}`,
);
process.exit(ok ? 0 : 1);
