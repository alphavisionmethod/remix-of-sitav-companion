/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub: Tab Registry Coverage Gate
// Tier: BLOCK
//
// Asserts:
//   1. Every panel under src/components/admin/ai-runtime/**.tsx and
//      every board under src/pages/admin/ai-runtime/**.tsx is either
//      registered in AI_ENGINEER_HUB_TABS or in the explicit ARCHIVED
//      allowlist below.
//   2. Every LOADERS entry in AIRuntimeHome.tsx maps to a real on-disk
//      file (no orphan loaders).
//   3. Every registry entry's componentPath resolves on disk.
//
// Emits: generated/ai-engineer-tab-registry-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { AI_ENGINEER_HUB_TABS } from "../../src/lib/admin/ai-engineer-hub/tab-registry";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const ROOT = resolve(process.cwd());

// Files that physically exist under the AI runtime surface but are NOT
// meant to be mounted as a hub tab (shared helpers, sub-cards, etc).
// Every entry must have a real reason — this list is operator-grade.
const ARCHIVED_OR_SHARED = new Set<string>([
  "AIRuntimeDrilldownPanel.tsx",       // shared drilldown surface, not a tab
  "TruthPanelActions.tsx",             // shared action helper for truth panels
]);

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip _shared and other underscore-prefixed helper folders.
      if (name.startsWith("_")) continue;
      out.push(...walk(full));
    } else if (name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function aliasToPath(alias: string): string {
  // "@/pages/admin/ai-runtime/SecurityCouncilBoard" -> src/pages/admin/ai-runtime/SecurityCouncilBoard.tsx
  const rel = alias.replace(/^@\//, "src/");
  return resolve(ROOT, `${rel}.tsx`);
}

const issues: GateIssue[] = [];

// (1) Every registry entry must resolve on disk.
const registeredPaths = new Set<string>();
for (const t of AI_ENGINEER_HUB_TABS) {
  const p = aliasToPath(t.componentPath);
  registeredPaths.add(p);
  if (!existsSync(p)) {
    issues.push({
      severity: "error",
      area: "registry",
      message: `Tab "${t.id}" componentPath does not exist on disk: ${t.componentPath} (resolved: ${p})`,
    });
  }
}

// (2) Every panel/board file must be registered or archived.
const candidateRoots = [
  resolve(ROOT, "src/components/admin/ai-runtime"),
  resolve(ROOT, "src/pages/admin/ai-runtime"),
];

const allFiles = candidateRoots.flatMap(walk).filter((f) => !f.endsWith("AIRuntimeHome.tsx"));

for (const f of allFiles) {
  const base = f.split("/").pop()!;
  if (ARCHIVED_OR_SHARED.has(base)) continue;
  if (!registeredPaths.has(f)) {
    issues.push({
      severity: "error",
      area: "orphan",
      message: `File is not registered in AI_ENGINEER_HUB_TABS and not in ARCHIVED_OR_SHARED allowlist: ${f.replace(`${ROOT}/`, "")}`,
    });
  }
}

// (3) Every LOADERS import in AIRuntimeHome.tsx must resolve.
const homePath = resolve(ROOT, "src/pages/admin/ai-runtime/AIRuntimeHome.tsx");
if (existsSync(homePath)) {
  const src = readFileSync(homePath, "utf8");
  const importRegex = /import\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = importRegex.exec(src))) {
    const alias = m[1];
    if (!alias.startsWith("@/")) continue;
    const p = aliasToPath(alias);
    if (!existsSync(p)) {
      issues.push({
        severity: "error",
        area: "loader",
        message: `AIRuntimeHome.tsx LOADERS references non-existent module: ${alias}`,
      });
    }
  }
} else {
  issues.push({
    severity: "error",
    area: "loader",
    message: "AIRuntimeHome.tsx not found — hub page is missing.",
  });
}

const ok = issues.filter((i) => i.severity === "error").length === 0;

const file = emitGateReport({
  gate: "ai-engineer-tab-registry",
  ok,
  issues,
  extra: {
    tier: "BLOCK",
    scope: "admin-ai-engineer-team",
    totalRegisteredTabs: AI_ENGINEER_HUB_TABS.length,
    totalOnDiskFiles: allFiles.length,
    archivedOrShared: Array.from(ARCHIVED_OR_SHARED),
  },
});

console.log(
  `[ai-engineer-tab-registry] ${ok ? "OK" : "FAIL"} — ${AI_ENGINEER_HUB_TABS.length} registered, ${allFiles.length} on disk, ${issues.length} issues → ${file}`,
);
process.exit(ok ? 0 : 1);
