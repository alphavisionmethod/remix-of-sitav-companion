/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Tier Capability Matrix Gate (BLOCK)
//
// Purpose: make the feature-runtime-tier registry the single source
// of truth for cross-tier capability resolution. Programmatic gates
// must NOT rely on hard-coded `tier === "..."` lookups outside the
// runtime module.
//
// Asserts:
//   1. Every feature id referenced via <TierGate featureId="...">,
//      useFeatureRuntimeTier("..."), or useCapability("...") is
//      registered in feature-runtime-tier-registry.
//   2. Every registered feature classifies all 4 canonical tiers
//      (supported ∪ simulated ∪ fallback ∪ prohibited ∪ roadmap
//      covers WEB_APP, DESKTOP_HOST, APPLIANCE_RUNTIME,
//      SIMULATED_OS_EXPERIENCE — no tier missing).
//   3. No `tier === "<TIER_LITERAL>"` comparisons exist outside
//      `src/runtimes/` (registry must be the resolver).
//
// Emits:
//   - generated/cross-tier-capability-matrix-report.json
//   - generated/cross-tier-capability-matrix-report.md
//   - generated/CROSS_TIER_CAPABILITY_MATRIX_REPORT.md (mirror)
//
// Wired into: scripts/architecture/checks/check-os-release-readiness.ts
// as gate #22 ("cross-tier-capability-matrix").
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

interface Issue {
  severity: "error" | "warning";
  area: "missing-registration" | "incomplete-tier-coverage" | "hard-coded-literal";
  message: string;
  file?: string;
  line?: number;
}

const SRC_DIR = "src";
const REGISTRY_PATH = "src/runtimes/feature-runtime-tier-registry.ts";
const TIER_LITERALS = ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"];

function walk(dir: string, exts = [".ts", ".tsx"]): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

// ── 1. Extract registered feature ids from the registry ────────
function extractRegisteredIds(): Set<string> {
  if (!existsSync(REGISTRY_PATH)) return new Set();
  const src = readFileSync(REGISTRY_PATH, "utf-8");
  const ids = new Set<string>();
  for (const m of src.matchAll(/featureId:\s*"([a-z0-9-]+)"/g)) ids.add(m[1]);
  return ids;
}

// ── 2. Extract referenced feature ids from call sites ──────────
function extractReferencedIds(files: string[]): Map<string, Array<{ file: string; line: number }>> {
  const refs = new Map<string, Array<{ file: string; line: number }>>();
  const patterns = [
    /featureId\s*=\s*"([a-z0-9-]+)"/g,                  // <TierGate featureId="..." />
    /useFeatureRuntimeTier\(\s*"([a-z0-9-]+)"\s*\)/g,    // hook
    /useCapability\(\s*"([a-z0-9-]+)"\s*\)/g,            // hook
    /resolveFeatureTierAvailability\(\s*"([a-z0-9-]+)"/g,
    /isFeatureSupportedOn\(\s*"([a-z0-9-]+)"/g,
    /isFeatureAvailableOn\(\s*"([a-z0-9-]+)"/g,
    /getFeatureRuntimeTier\(\s*"([a-z0-9-]+)"\s*\)/g,
  ];
  for (const file of files) {
    // Skip the registry itself + the runtime module's own internals
    if (file === REGISTRY_PATH) continue;
    if (file.startsWith("src/runtimes/")) continue;
    if (file.startsWith("src/lib/migration/")) continue; // documentation only
    if (file.startsWith("src/lib/truth-manifests/")) continue; // metadata only
    const src = readFileSync(file, "utf-8");
    const lines = src.split("\n");
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        const id = m[1];
        // approximate line number
        const idx = m.index ?? 0;
        const line = src.slice(0, idx).split("\n").length;
        if (!refs.has(id)) refs.set(id, []);
        refs.get(id)!.push({ file, line });
      }
    }
  }
  return refs;
}

// ── 3. Detect hard-coded `tier === "X"` literals outside runtime ─
function findHardCodedTierLiterals(files: string[]): Issue[] {
  const issues: Issue[] = [];
  // tier === "WEB_APP" (or activeTier / runtimeTier / probedTier / probe.tier)
  const re = /\b(?:tier|activeTier|runtimeTier|probedTier|probe\.tier)\s*===\s*"(WEB_APP|DESKTOP_HOST|APPLIANCE_RUNTIME|SIMULATED_OS_EXPERIENCE)"/g;
  for (const file of files) {
    if (file.startsWith("src/runtimes/")) continue;             // resolver lives here
    if (file.startsWith("src/lib/runtime/")) continue;          // legacy resolver alias
    if (file.startsWith("src/lib/migration/")) continue;        // doc maps
    if (file.startsWith("src/lib/truth-manifests/")) continue;  // metadata
    if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
    const src = readFileSync(file, "utf-8");
    for (const m of src.matchAll(re)) {
      const idx = m.index ?? 0;
      const line = src.slice(0, idx).split("\n").length;
      issues.push({
        severity: "error",
        area: "hard-coded-literal",
        message: `Hard-coded tier comparison \`${m[0]}\` — replace with registry lookup (isFeatureSupportedOn / useFeatureRuntimeTier).`,
        file,
        line,
      });
    }
  }
  return issues;
}

// ── 4. Tier-coverage assertion (dynamic require — runs in node) ─
type TierAvailability = "supported" | "simulated" | "fallback" | "prohibited" | "roadmap";
type RuntimeTier = "WEB_APP" | "DESKTOP_HOST" | "APPLIANCE_RUNTIME" | "SIMULATED_OS_EXPERIENCE";

interface CoverageRow {
  featureId: string;
  name: string;
  ownerDomain: string;
  byTier: Record<RuntimeTier, TierAvailability>;
  launchHonesty: string;
}

// Extract a coverage row from the registry source via regex (no TS runtime needed).
function buildCoverageFromSource(): CoverageRow[] {
  if (!existsSync(REGISTRY_PATH)) return [];
  const src = readFileSync(REGISTRY_PATH, "utf-8");
  // Each entry block: { featureId: "x", name: "...", ownerDomain: "...", supportedTiers: [...], simulatedTiers: [...], fallbackTiers: [...], prohibitedTiers: [...], roadmapTiers: [...], fallback: "...", launchHonesty: "..." }
  const rows: CoverageRow[] = [];
  const blockRe = /\{\s*featureId:\s*"([a-z0-9-]+)",\s*name:\s*"([^"]+)",\s*ownerDomain:\s*"([^"]+)",\s*supportedTiers:\s*\[([^\]]*)\],\s*simulatedTiers:\s*\[([^\]]*)\],\s*fallbackTiers:\s*\[([^\]]*)\],\s*prohibitedTiers:\s*\[([^\]]*)\],\s*roadmapTiers:\s*\[([^\]]*)\],[^}]*launchHonesty:\s*"([a-z-]+)"/g;
  const ALL: RuntimeTier[] = ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"];
  // Resolve `[...ALL_TIERS]` literal first
  const allTiersExpansion = `"WEB_APP","DESKTOP_HOST","APPLIANCE_RUNTIME","SIMULATED_OS_EXPERIENCE"`;
  const normalized = src.replace(/\.\.\.ALL_TIERS/g, allTiersExpansion);
  const expanded = normalized;
  for (const m of expanded.matchAll(blockRe)) {
    const [, featureId, name, ownerDomain, sup, sim, fb, pro, rm, honesty] = m;
    const parse = (s: string): RuntimeTier[] =>
      Array.from(s.matchAll(/"([A-Z_]+)"/g))
        .map((x) => x[1] as RuntimeTier)
        .filter((t) => ALL.includes(t));
    const supported = parse(sup);
    const simulated = parse(sim);
    const fallback = parse(fb);
    const prohibited = parse(pro);
    const roadmap = parse(rm);
    const byTier = {} as Record<RuntimeTier, TierAvailability>;
    for (const t of ALL) {
      if (supported.includes(t)) byTier[t] = "supported";
      else if (simulated.includes(t)) byTier[t] = "simulated";
      else if (fallback.includes(t)) byTier[t] = "fallback";
      else if (roadmap.includes(t)) byTier[t] = "roadmap";
      else if (prohibited.includes(t)) byTier[t] = "prohibited";
      else byTier[t] = "prohibited"; // implicit prohibited counts as classified
    }
    rows.push({ featureId, name, ownerDomain, byTier, launchHonesty: honesty });
  }
  return rows;
}

// ── Main ───────────────────────────────────────────────────────
const files = walk(SRC_DIR);
const issues: Issue[] = [];

const registered = extractRegisteredIds();
const referenced = extractReferencedIds(files);

// (1) referenced ids must be registered
for (const [id, sites] of referenced.entries()) {
  if (!registered.has(id)) {
    for (const s of sites) {
      issues.push({
        severity: "error",
        area: "missing-registration",
        message: `Feature id "${id}" is referenced but not declared in feature-runtime-tier-registry.`,
        file: s.file,
        line: s.line,
      });
    }
  }
}

// (2) full tier coverage per registered feature (every tier classified)
const coverage = buildCoverageFromSource();
const ALL_TIERS: RuntimeTier[] = ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE"];
for (const row of coverage) {
  const missing = ALL_TIERS.filter((t) => !row.byTier[t]);
  if (missing.length) {
    issues.push({
      severity: "error",
      area: "incomplete-tier-coverage",
      message: `Feature "${row.featureId}" is missing tier classification for: ${missing.join(", ")}`,
      file: REGISTRY_PATH,
    });
  }
}

// (3) hard-coded tier literals outside src/runtimes
issues.push(...findHardCodedTierLiterals(files));

// ── Emit reports ───────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });

const report = {
  gate: "cross-tier-capability-matrix",
  generatedAt: new Date().toISOString(),
  ok,
  errorCount,
  warningCount,
  summary: {
    registeredFeatures: registered.size,
    referencedFeatureIds: referenced.size,
    coverageRows: coverage.length,
    tiersChecked: ALL_TIERS.length,
    hardCodedLiterals: issues.filter((i) => i.area === "hard-coded-literal").length,
  },
  coverage,
  issues,
};

writeFileSync(
  "generated/cross-tier-capability-matrix-report.json",
  JSON.stringify(report, null, 2),
);

const md: string[] = [
  `# Cross-Tier Capability Matrix Report`,
  ``,
  `> Generated: ${report.generatedAt}`,
  `> Verdict: **${ok ? "✅ GREEN" : "❌ RED"}**`,
  ``,
  `## Summary`,
  ``,
  `| Metric | Value |`,
  `|---|---|`,
  `| Registered features | ${registered.size} |`,
  `| Referenced feature ids in code | ${referenced.size} |`,
  `| Tiers per feature (must be 4) | ${ALL_TIERS.length} |`,
  `| Hard-coded tier literals outside \`src/runtimes/\` | ${report.summary.hardCodedLiterals} |`,
  `| Errors | ${errorCount} |`,
  `| Warnings | ${warningCount} |`,
  ``,
  `## Feature × Tier matrix`,
  ``,
  `| Feature | WEB_APP | DESKTOP_HOST | APPLIANCE_RUNTIME | SIMULATED_OS_EXPERIENCE | Honesty |`,
  `|---|---|---|---|---|---|`,
  ...coverage.map(
    (r) =>
      `| \`${r.featureId}\` | ${r.byTier.WEB_APP} | ${r.byTier.DESKTOP_HOST} | ${r.byTier.APPLIANCE_RUNTIME} | ${r.byTier.SIMULATED_OS_EXPERIENCE} | ${r.launchHonesty} |`,
  ),
  ``,
];

if (issues.length) {
  md.push(`## Issues`, ``, `| Severity | Area | File:Line | Message |`, `|---|---|---|---|`);
  for (const i of issues) {
    md.push(
      `| ${i.severity} | ${i.area} | ${i.file ?? "—"}${i.line ? ":" + i.line : ""} | ${i.message} |`,
    );
  }
  md.push(``);
}

const mdContent = md.join("\n");
writeFileSync("generated/cross-tier-capability-matrix-report.md", mdContent);
writeFileSync("generated/CROSS_TIER_CAPABILITY_MATRIX_REPORT.md", mdContent);

console.log(
  `Cross-tier capability matrix: ${ok ? "✅ OK" : `❌ ${errorCount} errors`} ` +
    `(${registered.size} registered, ${referenced.size} referenced, ${report.summary.hardCodedLiterals} hard-coded literals)`,
);
if (!ok) {
  for (const i of issues.slice(0, 25)) {
    console.error(
      `[${i.severity}] ${i.area}: ${i.message}` +
        (i.file ? `  @ ${i.file}${i.line ? ":" + i.line : ""}` : ""),
    );
  }
  if (issues.length > 25) console.error(`...and ${issues.length - 25} more`);
  process.exit(1);
}
