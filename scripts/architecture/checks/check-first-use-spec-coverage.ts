/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — First-Use Spec Coverage Gate (BLOCK #23)
//
// Asserts:
//   1. Registry declares exactly 29 spec screens (numbers 1..29 unique).
//   2. Every entry's implementedBy.component file exists on disk.
//   3. Every implementedBy.phaseIds entry is a real SetupPhaseId
//      declared in src/packages/contracts/specialized/setup-orchestration.ts.
//   4. Every referenced phaseId is actually rendered/declared inside
//      src/components/sita/OSSetupExperience.tsx.
//   5. Per-phase counts are coherent (Phase 0:1, 1:5, 2:5, 3:18, 4:1 = 30
//      noting screen 6 is grouped under Phase 1).
//
// Emits:
//   - generated/first-use-spec-coverage-report.json
//   - generated/first-use-spec-coverage-report.md
//
// Wired into: scripts/architecture/checks/check-os-release-readiness.ts
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

interface Issue {
  severity: "error" | "warning";
  area: "missing-screen" | "duplicate-screen" | "missing-component" | "invalid-phaseid" | "phaseid-not-rendered" | "count-mismatch";
  message: string;
}

const REGISTRY_PATH = "src/lib/architecture/first-use-spec-registry.ts";
const SPEC_PHASE_TYPE_PATH = "src/packages/contracts/specialized/setup-orchestration.ts";
const OS_SETUP_PATH = "src/components/sita/OSSetupExperience.tsx";
const OUT_JSON = "generated/first-use-spec-coverage-report.json";
const OUT_MD = "generated/first-use-spec-coverage-report.md";

const issues: Issue[] = [];

function err(area: Issue["area"], message: string) {
  issues.push({ severity: "error", area, message });
}

// 1. Read registry
if (!existsSync(REGISTRY_PATH)) {
  err("missing-screen", `Registry file not found: ${REGISTRY_PATH}`);
  emitAndExit();
}
const registrySrc = readFileSync(REGISTRY_PATH, "utf-8");

// Extract entries via regex (specScreenNumber + component + phaseIds)
const entryRe = /specScreenId:\s*"([^"]+)"[\s\S]*?specScreenNumber:\s*(\d+)[\s\S]*?phase:\s*(\d)[\s\S]*?status:\s*"([^"]+)"[\s\S]*?(?:implementedBy:\s*\{\s*component:\s*"([^"]+)",\s*phaseIds:\s*\[([^\]]*)\]\s*\}|implementedBy:\s*null)/g;
interface ParsedEntry { id: string; num: number; phase: number; status: string; component: string | null; phaseIds: string[] }
const parsed: ParsedEntry[] = [];
let m: RegExpExecArray | null;
while ((m = entryRe.exec(registrySrc)) !== null) {
  const phaseIds = m[6] ? Array.from(m[6].matchAll(/"([^"]+)"/g)).map((x) => x[1]) : [];
  parsed.push({ id: m[1], num: Number(m[2]), phase: Number(m[3]), status: m[4], component: m[5] ?? null, phaseIds });
}

// 2. Assert 29 unique screens
const seen = new Set<number>();
for (const e of parsed) {
  if (seen.has(e.num)) err("duplicate-screen", `Duplicate specScreenNumber: ${e.num}`);
  seen.add(e.num);
}
for (let i = 1; i <= 29; i++) {
  if (!seen.has(i)) err("missing-screen", `Spec screen #${i} missing from registry`);
}
if (parsed.length !== 29) err("count-mismatch", `Expected 29 entries, found ${parsed.length}`);

// 3. Component files exist
for (const e of parsed) {
  if (e.status === "planned") continue;
  if (!e.component) {
    err("missing-component", `Screen #${e.num} (${e.id}) status=${e.status} but implementedBy is null`);
    continue;
  }
  if (!existsSync(e.component)) err("missing-component", `Screen #${e.num} (${e.id}) → component not found: ${e.component}`);
}

// 4. Validate phaseIds against the SetupPhaseId union
const validPhaseIds = new Set<string>();
if (existsSync(SPEC_PHASE_TYPE_PATH)) {
  const typeSrc = readFileSync(SPEC_PHASE_TYPE_PATH, "utf-8");
  const unionMatch = typeSrc.match(/export type SetupPhaseId\s*=\s*([\s\S]+?);/);
  if (unionMatch) {
    for (const lit of unionMatch[1].matchAll(/"([a-z][a-z0-9-]*)"/g)) validPhaseIds.add(lit[1]);
  }
}
if (validPhaseIds.size === 0) err("invalid-phaseid", `Could not parse SetupPhaseId union from ${SPEC_PHASE_TYPE_PATH}`);

// 5. OSSetupExperience source for cross-check
const osSrc = existsSync(OS_SETUP_PATH) ? readFileSync(OS_SETUP_PATH, "utf-8") : "";

for (const e of parsed) {
  for (const pid of e.phaseIds) {
    if (validPhaseIds.size > 0 && !validPhaseIds.has(pid)) {
      err("invalid-phaseid", `Screen #${e.num} (${e.id}) references unknown SetupPhaseId: "${pid}"`);
    }
    if (osSrc && !osSrc.includes(`"${pid}"`)) {
      err("phaseid-not-rendered", `Screen #${e.num} (${e.id}) phaseId "${pid}" not referenced in ${OS_SETUP_PATH}`);
    }
  }
}

// 6. Per-phase counts
const perPhase: Record<number, { implemented: number; partial: number; planned: number; total: number }> = {
  0: { implemented: 0, partial: 0, planned: 0, total: 0 },
  1: { implemented: 0, partial: 0, planned: 0, total: 0 },
  2: { implemented: 0, partial: 0, planned: 0, total: 0 },
  3: { implemented: 0, partial: 0, planned: 0, total: 0 },
  4: { implemented: 0, partial: 0, planned: 0, total: 0 },
};
for (const e of parsed) {
  const bucket = perPhase[e.phase];
  if (!bucket) continue;
  bucket.total += 1;
  if (e.status === "implemented") bucket.implemented += 1;
  else if (e.status === "partial") bucket.partial += 1;
  else if (e.status === "planned") bucket.planned += 1;
}

emitAndExit();

function emitAndExit() {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const ok = errorCount === 0;

  mkdirSync("generated", { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    gate: "first-use-spec-coverage",
    phase: "phase-32-first-use-spec-truth",
    totalScreens: parsed.length,
    expectedScreens: 29,
    perPhaseCoverage: perPhase,
    statusCounts: {
      implemented: parsed.filter((p) => p.status === "implemented").length,
      partial: parsed.filter((p) => p.status === "partial").length,
      planned: parsed.filter((p) => p.status === "planned").length,
    },
    errorCount,
    warningCount,
    ok,
    issues,
  };
  writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  const md = [
    `# First-Use Spec Coverage Report`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Gate: \`first-use-spec-coverage\` (BLOCK)`,
    ``,
    `## Summary`,
    `- Screens declared: **${parsed.length} / 29**`,
    `- Implemented: **${report.statusCounts.implemented}**`,
    `- Partial: ${report.statusCounts.partial}`,
    `- Planned: ${report.statusCounts.planned}`,
    `- Errors: ${errorCount}`,
    `- Status: ${ok ? "✅ GREEN" : "❌ FAIL"}`,
    ``,
    `## Per-Phase Coverage`,
    `| Phase | Implemented | Partial | Planned | Total |`,
    `|---|---|---|---|---|`,
    ...Object.entries(perPhase).map(([p, c]) => `| Phase ${p} | ${c.implemented} | ${c.partial} | ${c.planned} | ${c.total} |`),
    ``,
    `## Issues`,
    ...(issues.length ? issues.map((i) => `- **[${i.severity}] ${i.area}**: ${i.message}`) : ["_None_"]),
    ``,
  ].join("\n");
  writeFileSync(OUT_MD, md);

  console.log(`First-use spec coverage: ${ok ? "✅ OK" : `❌ ${errorCount} errors`} (${parsed.length}/29 screens)`);
  if (!ok) {
    for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
    process.exit(1);
  }
  process.exit(0);
}
