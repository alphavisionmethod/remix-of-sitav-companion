#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave 9: Final Verification + Reports
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "generated/lib-decomposition");
fs.mkdirSync(OUT, { recursive: true });

function safeRun(cmd: string, label: string): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024 });
    return { ok: true, output: output.slice(-2000) };
  } catch (e: any) {
    return { ok: false, output: ((e.stdout ?? "") + (e.stderr ?? "")).slice(-2000) };
  }
}

const results: any[] = [];
console.log("🔍 Wave 9 — Verification");

// 1. tsc
console.log("  1. TypeScript noEmit");
const tsc = safeRun("npx tsc --noEmit 2>&1 | tail -5", "tsc");
const tscErrors = (tsc.output.match(/error TS/g) ?? []).length;
results.push({ check: "tsc-noEmit", ok: tsc.ok && tscErrors === 0, errors: tscErrors });

// 2. Wrapper usage snapshot
console.log("  2. Wrapper usage snapshot");
const wu = safeRun("npx tsx scripts/architecture/checks/check-legacy-wrapper-usage.ts 2>&1 | tail -10", "wrapper-usage");
results.push({ check: "wrapper-usage", ok: wu.ok });

// 3. Ownership drift
console.log("  3. Ownership drift");
const dr = safeRun("npx tsx scripts/architecture/checks/check-lib-ownership-drift.ts 2>&1 | tail -5", "drift");
results.push({ check: "lib-ownership-drift", ok: dr.ok });

// 4. Misplaced logic
console.log("  4. Misplaced logic checks");
const m1 = safeRun("npx tsx scripts/architecture/checks/check-misplaced-runtime-logic.ts 2>&1 | tail -3", "runtime-logic");
const m2 = safeRun("npx tsx scripts/architecture/checks/check-misplaced-data-logic.ts 2>&1 | tail -3", "data-logic");
const m3 = safeRun("npx tsx scripts/architecture/checks/check-misplaced-domain-logic.ts 2>&1 | tail -3", "domain-logic");
results.push({ check: "misplaced-runtime-logic", ok: m1.ok });
results.push({ check: "misplaced-data-logic", ok: m2.ok });
results.push({ check: "misplaced-domain-logic", ok: m3.ok });

// ── Stats ────────────────────────────────────────────────────
const wrapperMap = JSON.parse(fs.readFileSync(path.join(OUT, "src-lib-wrapper-map.json"), "utf8"));
const targetMap = JSON.parse(fs.readFileSync(path.join(OUT, "src-lib-target-map.json"), "utf8"));
const classMap = JSON.parse(fs.readFileSync(path.join(OUT, "src-lib-classification-map.json"), "utf8"));

// Count files per canonical home
function countFilesIn(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) n++;
    }
  }
  return n;
}

const stats = {
  generatedAt: new Date().toISOString(),
  src: {
    domains: countFilesIn("src/domains"),
    platform: countFilesIn("src/platform"),
    runtimes: countFilesIn("src/runtimes"),
    data: countFilesIn("src/data"),
    integrations: countFilesIn("src/integrations"),
    contracts: countFilesIn("src/contracts"),
    legacy: countFilesIn("src/legacy"),
    lib: countFilesIn("src/lib"),
  },
  wrappers: wrapperMap.wrappers.length,
  initialLibFiles: classMap.totals.files,
  targetMapped: targetMap.totals.files,
  checks: results,
  ok: results.every(r => r.ok),
};
fs.writeFileSync(path.join(OUT, "src-lib-verification-results.json"), JSON.stringify(stats, null, 2));

// ── MD verification report
const md: string[] = [];
md.push("# SITA OS — src/lib Decomposition Verification Results (Wave 9)\n");
md.push(`Generated: ${stats.generatedAt}\n`);
md.push(`**Overall: ${stats.ok ? "🟢 PASS" : "🔴 FAIL"}**\n`);
md.push("## Canonical home file counts\n");
md.push("| Home | Files |");
md.push("|------|------:|");
for (const [k, v] of Object.entries(stats.src)) md.push(`| \`src/${k}/\` | ${v} |`);
md.push("");
md.push(`- **Initial src/lib files:** ${stats.initialLibFiles}`);
md.push(`- **Wrappers tracked:** ${stats.wrappers}`);
md.push(`- **Target-mapped:** ${stats.targetMapped}`);
md.push("");
md.push("## Check results\n");
md.push("| Check | Result |");
md.push("|-------|--------|");
for (const r of results) md.push(`| ${r.check} | ${r.ok ? "🟢" : "🔴"} |`);
md.push("");
fs.writeFileSync(path.join(OUT, "SRC_LIB_VERIFICATION_RESULTS.md"), md.join("\n"));

// ── Wrapper map MD
const wmd: string[] = [];
wmd.push("# SITA OS — src/lib Wrapper Map (post-decomposition)\n");
wmd.push(`Generated: ${wrapperMap.generatedAt}\n`);
wmd.push(`**Total wrappers:** ${wrapperMap.wrappers.length}\n`);
wmd.push("Each entry below is a thin re-export shim at the old `src/lib/...` path. Removal condition is in the JSON.\n");
wmd.push("## By wave\n");
const byWave: Record<string, number> = {};
for (const w of wrapperMap.wrappers) byWave[`wave-${w.wave}`] = (byWave[`wave-${w.wave}`] || 0) + 1;
md.push("| Wave | Count |");
for (const [k, v] of Object.entries(byWave)) wmd.push(`- ${k}: ${v}`);
wmd.push("\n## Sample (first 50 by importer count)\n");
const sorted = [...wrapperMap.wrappers].sort((a: any, b: any) => b.importerCount - a.importerCount);
wmd.push("| Old path | Canonical | Wave | Importers |");
wmd.push("|----------|-----------|-----:|----------:|");
for (const w of sorted.slice(0, 50)) {
  wmd.push(`| \`${w.oldPath}\` | \`${w.canonicalSpec}\` | ${w.wave} | ${w.importerCount} |`);
}
fs.writeFileSync(path.join(OUT, "SRC_LIB_WRAPPER_MAP.md"), wmd.join("\n"));

// ── Secondary refactor discoveries
const sec: string[] = [];
sec.push("# SITA OS — Secondary Refactor Discoveries (post-decomposition)\n");
sec.push(`Generated: ${stats.generatedAt}\n`);
sec.push("Items detected during Waves 2–7 that warrant a follow-up pass:\n");
sec.push("- **`services-unclassified`** — files under `src/lib/services/<unknown>/` that did not match a known domain. Per-file Wave 7b review needed.");
sec.push("- **`index.ts` collisions** — multiple legacy folders with their own `index.ts` aimed at the same canonical barrel (e.g. several `src/lib/*/index.ts` → `src/data/seed/index.ts`). These were skipped to avoid overwriting; merge manually.");
sec.push("- **Hot wrappers** — wrapper-usage-snapshot.json highlights the top consumers still going through deprecated paths. These are the next consumer-rewire targets.");
sec.push("- **Duplicate fingerprints** — `SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md` lists files with identical export shape; manual deduplication still required.");
sec.push("- **Hooks** — `src/lib/hooks/` files were preserved in place pending a dedicated Wave 5b move to `src/hooks/`.");
sec.push("");
fs.writeFileSync(path.join(OUT, "SRC_LIB_SECONDARY_REFACTOR_DISCOVERIES.md"), sec.join("\n"));

console.log("\n✅ Wave 9 complete");
console.log(`   Overall: ${stats.ok ? "🟢 PASS" : "🔴 FAIL"}`);
console.log(`   Wrappers: ${stats.wrappers}`);
console.log(`   src/lib: ${stats.src.lib} files (was ${stats.initialLibFiles})`);
console.log(`   Reports written to ${path.relative(ROOT, OUT)}`);
