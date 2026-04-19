/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub: Primitive Coverage Gate
// Tier: BLOCK
//
// For every registered tab, asserts:
//   1. The panel imports StatusBadge from canonical primitives — OR
//      it has zero status-bearing badges. (Raw shadcn `Badge` for
//      status display is forbidden inside ai-runtime panels.)
//   2. No raw status-color literals (bg-emerald-500/15, text-amber-600,
//      etc.) appear in the panel — all status tones must go through
//      `StatusTone`.
//   3. If the tab declares `requiresOperatorAction: true`, the panel
//      must import `OperatorActionPanel` (sweep coverage gate enforces
//      composition; this gate enforces import-presence so the sweep is
//      visible).
//
// Emits: generated/ai-engineer-primitive-coverage-report.json
//        + generated/admin-ai-engineer-team/primitive-coverage.json
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

// Forbidden raw status-color literal patterns (status only; layout
// utilities like bg-muted are allowed because they are semantic tokens).
const FORBIDDEN_COLOR_PATTERNS = [
  /\bbg-(emerald|green|amber|yellow|red|rose|orange|sky|blue)-\d{2,3}(\/\d+)?\b/g,
  /\btext-(emerald|green|amber|yellow|red|rose|orange|sky|blue)-\d{2,3}\b/g,
  /\bborder-(emerald|green|amber|yellow|red|rose|orange|sky|blue)-\d{2,3}(\/\d+)?\b/g,
];

interface PanelCoverage {
  tabId: string;
  componentPath: string;
  fileExists: boolean;
  importsStatusBadge: boolean;
  importsOperatorActionPanel: boolean;
  importsAITruthDisclosure: boolean;
  importsTrustCopyMap: boolean;
  rawShadcnBadgeUsed: boolean;
  forbiddenColorHits: string[];
  requiresOperatorAction: boolean;
  // Final per-tab grade.
  primitiveScore: number; // 0–6
  ok: boolean;
}

const issues: GateIssue[] = [];
const coverage: PanelCoverage[] = [];

for (const t of AI_ENGINEER_HUB_TABS) {
  const p = aliasToPath(t.componentPath);
  const exists = existsSync(p);
  if (!exists) {
    coverage.push({
      tabId: t.id,
      componentPath: t.componentPath,
      fileExists: false,
      importsStatusBadge: false,
      importsOperatorActionPanel: false,
      importsAITruthDisclosure: false,
      importsTrustCopyMap: false,
      rawShadcnBadgeUsed: false,
      forbiddenColorHits: [],
      requiresOperatorAction: t.requiresOperatorAction,
      primitiveScore: 0,
      ok: false,
    });
    continue;
  }
  const src = readFileSync(p, "utf8");

  const importsStatusBadge =
    /from\s+["'`]@\/components\/primitives\/status\/StatusBadge["'`]/.test(src) ||
    /from\s+["'`]@\/components\/primitives\/status["'`]/.test(src);
  const importsOperatorActionPanel =
    /from\s+["'`]@\/components\/primitives\/actions\/OperatorActionPanel["'`]/.test(src) ||
    /from\s+["'`]@\/components\/primitives\/actions["'`]/.test(src);
  const importsAITruthDisclosure =
    /from\s+["'`]@\/components\/primitives\/status\/AITruthDisclosure["'`]/.test(src);
  const importsTrustCopyMap = /from\s+["'`]@\/lib\/trust-copy/.test(src);
  const rawShadcnBadgeUsed = /from\s+["'`]@\/components\/ui\/badge["'`]/.test(src);

  // Detect forbidden raw status colors anywhere in the file.
  const hits: string[] = [];
  for (const re of FORBIDDEN_COLOR_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) hits.push(m[0]);
  }
  const forbiddenColorHits = Array.from(new Set(hits)).sort();

  // Score each canonical D-section primitive present.
  let score = 0;
  if (importsStatusBadge) score++;
  if (importsAITruthDisclosure) score++;
  if (importsOperatorActionPanel) score++;
  if (importsTrustCopyMap) score++;
  // D1 EmptyState + D3 ConnectorStateBadge are surface-conditional —
  // counted as "n/a" (do not require). We reward presence if used.
  if (/from\s+["'`]@\/components\/primitives\/feedback\/EmptyState["'`]/.test(src)) score++;
  if (/from\s+["'`]@\/components\/connectors\/ConnectorStateBadge["'`]/.test(src)) score++;

  const tabIssues: GateIssue[] = [];

  // WARN-tier (Phase 4): raw status-color literals — sweep planned.
  if (forbiddenColorHits.length > 0) {
    tabIssues.push({
      severity: "warning",
      area: "color-literal",
      message: `Tab "${t.id}" uses raw status-color literals (must go through StatusTone): ${forbiddenColorHits.slice(0, 4).join(", ")}${forbiddenColorHits.length > 4 ? `, +${forbiddenColorHits.length - 4} more` : ""} in ${t.componentPath}`,
    });
  }
  if (rawShadcnBadgeUsed && !importsStatusBadge) {
    tabIssues.push({
      severity: "warning",
      area: "raw-badge",
      message: `Tab "${t.id}" imports @/components/ui/badge but does not import StatusBadge — replace status badges with StatusBadge in ${t.componentPath}`,
    });
  }
  if (t.requiresOperatorAction && !importsOperatorActionPanel) {
    tabIssues.push({
      severity: "warning",
      area: "operator-action",
      message: `Tab "${t.id}" declares requiresOperatorAction=true but does not import OperatorActionPanel in ${t.componentPath}`,
    });
  }

  issues.push(...tabIssues);

  coverage.push({
    tabId: t.id,
    componentPath: t.componentPath,
    fileExists: true,
    importsStatusBadge,
    importsOperatorActionPanel,
    importsAITruthDisclosure,
    importsTrustCopyMap,
    rawShadcnBadgeUsed,
    forbiddenColorHits,
    requiresOperatorAction: t.requiresOperatorAction,
    primitiveScore: score,
    ok: tabIssues.length === 0,
  });
}

writeFileSync(
  join(OUT_DIR, "primitive-coverage.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalTabs: AI_ENGINEER_HUB_TABS.length,
      tabsWithStatusBadge: coverage.filter((c) => c.importsStatusBadge).length,
      tabsWithOperatorActionPanel: coverage.filter((c) => c.importsOperatorActionPanel).length,
      tabsWithAITruthDisclosure: coverage.filter((c) => c.importsAITruthDisclosure).length,
      tabsWithForbiddenColors: coverage.filter((c) => c.forbiddenColorHits.length > 0).length,
      averagePrimitiveScore:
        coverage.reduce((s, c) => s + c.primitiveScore, 0) / Math.max(1, coverage.length),
      panels: coverage,
    },
    null,
    2,
  ),
);

const errCount = issues.filter((i) => i.severity === "error").length;
const ok = errCount === 0;

const file = emitGateReport({
  gate: "ai-engineer-primitive-coverage",
  ok,
  issues,
  extra: {
    tier: "WARN",
    promotionTier: "BLOCK",
    scope: "admin-ai-engineer-team",
    totalTabs: AI_ENGINEER_HUB_TABS.length,
    tabsWithStatusBadge: coverage.filter((c) => c.importsStatusBadge).length,
    tabsWithOperatorActionPanel: coverage.filter((c) => c.importsOperatorActionPanel).length,
    tabsWithAITruthDisclosure: coverage.filter((c) => c.importsAITruthDisclosure).length,
    tabsWithForbiddenColors: coverage.filter((c) => c.forbiddenColorHits.length > 0).length,
  },
});

console.log(
  `[ai-engineer-primitive-coverage] ${ok ? "OK" : "FAIL"} — ${coverage.filter((c) => c.importsStatusBadge).length}/${AI_ENGINEER_HUB_TABS.length} tabs use StatusBadge, ${errCount} errors → ${file}`,
);
process.exit(ok ? 0 : 1);
