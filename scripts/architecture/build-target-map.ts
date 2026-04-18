#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 1: Build Target Ownership Map + Scaffold Skeleton
// Reads classification map, produces:
//   generated/lib-decomposition/src-lib-target-map.json
//   generated/lib-decomposition/SRC_LIB_CURRENT_TO_TARGET_MAP.md
//   generated/lib-decomposition/SRC_LIB_MIGRATION_PLAN.md
// And creates a minimal index.ts barrel at every distinct destination
// folder root so future moves have a real (non-theatre) home.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "generated/lib-decomposition");
const CLASS_MAP_PATH = path.join(OUT, "src-lib-classification-map.json");

if (!fs.existsSync(CLASS_MAP_PATH)) {
  console.error("❌ Run audit-src-lib.ts first.");
  process.exit(1);
}
const classMap = JSON.parse(fs.readFileSync(CLASS_MAP_PATH, "utf8"));
const records: Array<any> = classMap.records;

// ── Compute every target root (e.g. src/platform/policy) and ensure barrel
const destinationRoots = new Set<string>();
for (const r of records) {
  // Strip filename → folder root
  const dir = r.targetPath.split("/").slice(0, -1).join("/");
  if (!dir) continue;
  // Only scaffold under the canonical homes (not src/legacy/unclassified or src/lib stay-puts)
  if (
    dir.startsWith("src/domains/") ||
    dir.startsWith("src/platform/") ||
    dir.startsWith("src/runtimes/") ||
    dir.startsWith("src/data/") ||
    dir.startsWith("src/integrations/") ||
    dir.startsWith("src/contracts/") ||
    dir.startsWith("src/legacy/")
  ) {
    destinationRoots.add(dir);
  }
}

// Reduce to top-2 levels for barrel scaffolding (avoid hyper-fragmented index files)
const barrelDirs = new Set<string>();
for (const dir of destinationRoots) {
  const parts = dir.split("/");
  // src/platform/policy/foo/bar → barrel at src/platform/policy
  if (parts.length >= 3) barrelDirs.add(parts.slice(0, 3).join("/"));
}

let created = 0;
for (const dir of barrelDirs) {
  const abs = path.join(ROOT, dir);
  fs.mkdirSync(abs, { recursive: true });
  const indexPath = path.join(abs, "index.ts");
  if (!fs.existsSync(indexPath)) {
    const banner = [
      "// ═══════════════════════════════════════════════════════════════",
      `// SITA OS — Canonical Barrel: ${dir}`,
      "// Created by Wave 1 of src/lib decomposition.",
      "// Files migrated here from src/lib/* will be re-exported from this barrel.",
      "// Do NOT add deep cross-layer imports here.",
      "// ═══════════════════════════════════════════════════════════════",
      "export {};",
      "",
    ].join("\n");
    fs.writeFileSync(indexPath, banner);
    created++;
  }
}

// ── Build target-map JSON
const targetMap = {
  generatedAt: new Date().toISOString(),
  totals: {
    files: records.length,
    distinctTargetRoots: barrelDirs.size,
    destinationRoots: destinationRoots.size,
  },
  targets: records.map((r: any) => ({
    currentPath: r.path,
    targetPath: r.targetPath,
    klass: r.klass,
    klassReason: r.klassReason,
    domainHint: r.domainHint,
    importerCount: r.importerCount,
    isWrapperOnly: r.isWrapperOnly,
    migrationStrategy:
      r.klass === "shared-internal" ? "stay-in-place"
      : r.klass === "legacy" ? "archive-or-review"
      : r.isWrapperOnly ? "delete-after-rewire"
      : r.importerCount > 50 ? "move-with-wrapper-shim-required"
      : r.importerCount > 0 ? "move-with-wrapper-shim"
      : "move-direct",
  })),
};
fs.writeFileSync(path.join(OUT, "src-lib-target-map.json"), JSON.stringify(targetMap, null, 2));

// ── current → target MD
const md: string[] = [];
md.push("# SITA OS — src/lib Current → Target Map (Wave 1)\n");
md.push(`Generated: ${targetMap.generatedAt}\n`);
md.push(`- **Files mapped:** ${targetMap.totals.files}`);
md.push(`- **Distinct destination roots scaffolded:** ${targetMap.totals.distinctTargetRoots}`);
md.push(`- **Total destination folders touched:** ${targetMap.totals.destinationRoots}\n`);
md.push("## Migration strategy distribution\n");
const stratCount: Record<string, number> = {};
for (const t of targetMap.targets) stratCount[t.migrationStrategy] = (stratCount[t.migrationStrategy] || 0) + 1;
md.push("| Strategy | Count |");
md.push("|----------|------:|");
for (const [k, v] of Object.entries(stratCount)) md.push(`| ${k} | ${v} |`);
md.push("");
md.push("## Highest-risk moves (≥50 importers)\n");
md.push("| Importers | Current | → Target | Strategy |");
md.push("|----------:|---------|----------|----------|");
const risky = [...targetMap.targets].sort((a, b) => b.importerCount - a.importerCount).filter(t => t.importerCount >= 50);
for (const t of risky) md.push(`| ${t.importerCount} | \`${t.currentPath}\` | \`${t.targetPath}\` | ${t.migrationStrategy} |`);
md.push("\n## Full mapping (sample of first 200 — full data in JSON)\n");
md.push("| Current | → Target | Class | Importers |");
md.push("|---------|----------|-------|----------:|");
for (const t of targetMap.targets.slice(0, 200)) {
  md.push(`| \`${t.currentPath}\` | \`${t.targetPath}\` | ${t.klass} | ${t.importerCount} |`);
}
fs.writeFileSync(path.join(OUT, "SRC_LIB_CURRENT_TO_TARGET_MAP.md"), md.join("\n"));

// ── Migration plan MD
const plan: string[] = [];
plan.push("# SITA OS — src/lib Migration Plan (Wave 1)\n");
plan.push(`Generated: ${targetMap.generatedAt}\n`);
plan.push("## Wave Sequence\n");
plan.push("| Wave | Family | Files | Risk | Strategy |");
plan.push("|-----:|--------|------:|------|----------|");
const waveBuckets: Record<string, any[]> = {
  "Wave 2 — Data": [], "Wave 3 — Runtimes": [], "Wave 4 — Platform": [],
  "Wave 5 — Domains": [], "Wave 6 — Integrations": [], "Wave 7 — Contracts": [],
  "Wave 7b — Services remainder": [], "Stay (shared-internal)": [], "Legacy": [],
};
for (const t of targetMap.targets) {
  if (t.klass === "data") waveBuckets["Wave 2 — Data"].push(t);
  else if (t.klass === "runtime") waveBuckets["Wave 3 — Runtimes"].push(t);
  else if (t.klass === "platform" && !t.targetPath.includes("services-unclassified")) waveBuckets["Wave 4 — Platform"].push(t);
  else if (t.klass === "domain") waveBuckets["Wave 5 — Domains"].push(t);
  else if (t.klass === "integration") waveBuckets["Wave 6 — Integrations"].push(t);
  else if (t.klass === "contract") waveBuckets["Wave 7 — Contracts"].push(t);
  else if (t.targetPath.includes("services-unclassified")) waveBuckets["Wave 7b — Services remainder"].push(t);
  else if (t.klass === "shared-internal") waveBuckets["Stay (shared-internal)"].push(t);
  else if (t.klass === "legacy") waveBuckets["Legacy"].push(t);
}
for (const [name, items] of Object.entries(waveBuckets)) {
  const max = Math.max(0, ...items.map(i => i.importerCount));
  const risk = max >= 100 ? "🔴 CRITICAL" : max >= 50 ? "🟠 HIGH" : max >= 10 ? "🟡 MEDIUM" : "🟢 LOW";
  plan.push(`| ${name} | — | ${items.length} | ${risk} | move + wrapper shim |`);
}
plan.push("\n## Per-wave file counts and consumer pressure\n");
for (const [name, items] of Object.entries(waveBuckets)) {
  if (items.length === 0) continue;
  plan.push(`### ${name}  (${items.length} files)`);
  const top = [...items].sort((a, b) => b.importerCount - a.importerCount).slice(0, 5);
  plan.push("Top 5 by consumer count:");
  for (const t of top) plan.push(`- \`${t.currentPath}\` → \`${t.targetPath}\` (${t.importerCount} importers)`);
  plan.push("");
}
plan.push("## Safety contract\n");
plan.push("- Every moved file leaves a thin wrapper shim re-exporting from the canonical home.");
plan.push("- Wrappers are tracked in `src-lib-wrapper-map.json` and removed after consumers are rewired.");
plan.push("- Build runs after every wave; failed wave is reverted before proceeding.");
plan.push("- `src/lib/utils.ts` and `src/lib/utils/` stay in place (763+ importers, true shared utility).");
plan.push("- No file is silently deleted. Unclassified files go to `src/legacy/unclassified/` for manual review.\n");
fs.writeFileSync(path.join(OUT, "SRC_LIB_MIGRATION_PLAN.md"), plan.join("\n"));

console.log(`✅ Created ${created} new barrel index.ts files across ${barrelDirs.size} destination roots`);
console.log(`✅ Wrote src-lib-target-map.json (${targetMap.targets.length} entries)`);
console.log(`✅ Wrote SRC_LIB_CURRENT_TO_TARGET_MAP.md`);
console.log(`✅ Wrote SRC_LIB_MIGRATION_PLAN.md`);
console.log("\n📊 Wave bucket sizes:");
for (const [k, v] of Object.entries(waveBuckets)) console.log(`   ${k.padEnd(34)} ${v.length}`);
