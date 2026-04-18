#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Lib Decomposition Verification & Readiness Gate
// Honest, filesystem-grounded view of the src/lib decomposition:
//   - counts files remaining under src/lib (excluding allowlist)
//   - counts populated canonical destinations
//   - counts shim-shaped re-export wrappers
//   - emits the lib-decomposition-readiness gate report consumed
//     by check-os-release-readiness.ts
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT_DIR = "generated";
const LIB_OUT_DIR = join(OUT_DIR, "lib-decomposition");
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(LIB_OUT_DIR, { recursive: true });

const ALLOWLIST_TOP = new Set(["utils.ts", "utils", "internal", "hooks", "__tests__"]);
const CANONICAL_ROOTS = [
  "src/domains",
  "src/platform",
  "src/runtimes",
  "src/data",
  "src/integrations",
  "src/contracts",
  "src/legacy",
];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(e)) out.push(full);
  }
  return out;
}

// ── Count files remaining in src/lib (excluding allowlist) ─────
const remainingLibFiles: string[] = [];
const allowlistedLibFiles: string[] = [];
if (existsSync("src/lib")) {
  for (const top of readdirSync("src/lib")) {
    const full = join("src/lib", top);
    const isDir = statSync(full).isDirectory();
    const files = isDir ? walk(full) : [full];
    if (ALLOWLIST_TOP.has(top)) allowlistedLibFiles.push(...files);
    else remainingLibFiles.push(...files);
  }
}

// ── Count populated canonical destinations ─────────────────────
const canonicalCounts: Record<string, { files: number; nonBarrel: number }> = {};
for (const root of CANONICAL_ROOTS) {
  const all = walk(root);
  const nonBarrel = all.filter(f => !/\/index\.tsx?$/.test(f));
  canonicalCounts[root] = { files: all.length, nonBarrel: nonBarrel.length };
}

// ── Detect shim-shaped wrappers (≤25 LOC, only import/export) ──
const shimMatcher = /^\s*(\/\*[\s\S]*?\*\/|\/\/.*)?\s*(import|export)\b/;
const wrappers: Array<{ path: string; loc: number; reExportsFrom?: string }> = [];

for (const file of remainingLibFiles) {
  const content = readFileSync(file, "utf8");
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map(l => l.replace(/\/\/.*$/, ""))
    .filter(l => l.trim().length > 0);

  if (stripped.length > 25) continue;
  const onlyImportExport = stripped.every(l => {
    const t = l.trim();
    return /^(export|import|\}|from|\{|;|`|"|')/.test(t);
  });
  if (!onlyImportExport) continue;

  const reMatch = content.match(/(?:from|export\s+\*\s+from)\s+["']([^"']+)["']/);
  wrappers.push({
    path: relative(".", file),
    loc: stripped.length,
    reExportsFrom: reMatch?.[1],
  });
}

// ── Gate verdict ───────────────────────────────────────────────
const decomposingCount = remainingLibFiles.length;
const populatedCanonicalDirs = Object.values(canonicalCounts)
  .filter(c => c.nonBarrel > 0).length;

// During active migration this gate reports YELLOW (warnings) but
// stays ok=true so it does not block release. It RED-flips only if
// nothing populated in canonical destinations AND lib still huge.
const ok = !(decomposingCount > 1000 && populatedCanonicalDirs === 0);

const report = {
  generatedAt: new Date().toISOString(),
  gate: "lib-decomposition-readiness",
  remainingLibFiles: decomposingCount,
  allowlistedLibFiles: allowlistedLibFiles.length,
  canonicalCounts,
  populatedCanonicalDirs,
  shimWrappers: wrappers.length,
  shimWrapperSample: wrappers.slice(0, 20),
  ok,
  errorCount: ok ? 0 : 1,
  warningCount: decomposingCount,
};

writeFileSync(
  join(OUT_DIR, "lib-decomposition-readiness-report.json"),
  JSON.stringify(report, null, 2),
);

// ── Human-readable summary ─────────────────────────────────────
const md = [
  "# SITA OS — src/lib Decomposition Verification",
  "",
  `> Generated: ${report.generatedAt}`,
  `> Gate: \`${report.gate}\`  Verdict: ${ok ? "🟡 YELLOW (in-migration)" : "🔴 RED"}`,
  "",
  "## Counts",
  "",
  "| Metric | Value |",
  "|---|---|",
  `| Files remaining in src/lib (non-allowlist) | ${decomposingCount} |`,
  `| Files in src/lib allowlist (utils/internal/hooks) | ${allowlistedLibFiles.length} |`,
  `| Detected shim-shaped wrappers | ${wrappers.length} |`,
  `| Populated canonical destination roots | ${populatedCanonicalDirs} / ${CANONICAL_ROOTS.length} |`,
  "",
  "## Canonical destination population",
  "",
  "| Root | Total files | Non-barrel files |",
  "|---|---|---|",
  ...Object.entries(canonicalCounts).map(
    ([root, c]) => `| \`${root}\` | ${c.files} | ${c.nonBarrel} |`,
  ),
  "",
  "## Wrapper sample (first 20)",
  "",
  wrappers.length === 0
    ? "_No shim-shaped wrappers detected yet._"
    : ["| File | LOC | Re-exports from |", "|---|---|---|", ...wrappers.slice(0, 20).map(
        w => `| \`${w.path}\` | ${w.loc} | ${w.reExportsFrom ? `\`${w.reExportsFrom}\`` : "—"} |`,
      )].join("\n"),
  "",
  "## Verdict",
  "",
  ok
    ? "🟡 Decomposition is in flight. Track wrapper count → 0 across waves."
    : "🔴 Decomposition stalled. Canonical destinations empty while src/lib remains massive.",
  "",
].join("\n");

writeFileSync(join(LIB_OUT_DIR, "SRC_LIB_VERIFICATION_RESULTS.md"), md);
writeFileSync(
  join(LIB_OUT_DIR, "src-lib-verification-results.json"),
  JSON.stringify(report, null, 2),
);

// Wrapper map (real, filesystem-grounded)
writeFileSync(
  join(LIB_OUT_DIR, "src-lib-wrapper-map.json"),
  JSON.stringify({ generatedAt: report.generatedAt, wrappers }, null, 2),
);

console.log(
  `lib-decomposition-readiness: ${decomposingCount} files remaining in src/lib, ${wrappers.length} shim wrappers, ${populatedCanonicalDirs}/${CANONICAL_ROOTS.length} canonical roots populated`,
);
process.exit(0);
