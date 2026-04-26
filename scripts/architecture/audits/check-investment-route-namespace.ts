#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Guard: Investment Route Namespace
//
// Locks in Phase 5: `/investment` (singular) is the SINGLE
// canonical Investment Office route namespace. Any reappearance
// of `/investments/` (plural) inside the route family or
// registry surface is a hard fail. Plural legacy paths only live
// in `src/routes/redirects/user-redirect-map.ts` (compatibility
// surface) and as documentation strings — those locations are
// excluded from the scan.
//
// Exit codes:
//   0 — no plural occurrences in the guarded surface
//   1 — at least one plural occurrence detected
//
// Report: generated/investment-route-namespace-report.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "generated");
const REPORT_PATH = path.join(REPORT_DIR, "investment-route-namespace-report.json");

/** Files / directories that DEFINE the live route topology. */
const SCAN_TARGETS: Array<{ kind: "dir" | "file"; relPath: string; pattern?: RegExp }> = [
  { kind: "dir", relPath: "src/routes/families", pattern: /\.tsx?$/ },
  { kind: "file", relPath: "src/App.tsx" },
  { kind: "file", relPath: "src/routes/registry/route-family-registry.ts" },
];

/** Match: path="/investments" or path="/investments/..." in JSX/TSX. */
const PLURAL_RX = /path\s*=\s*["'`]\/investments(?:\/|["'`])/;

interface Violation {
  file: string;
  line: number;
  text: string;
}

function listFiles(target: { kind: "dir" | "file"; relPath: string; pattern?: RegExp }): string[] {
  const abs = path.join(ROOT, target.relPath);
  if (!fs.existsSync(abs)) return [];
  if (target.kind === "file") return [abs];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (target.pattern && !target.pattern.test(entry.name)) continue;
    out.push(path.join(abs, entry.name));
  }
  return out;
}

function scanFile(absPath: string): Violation[] {
  const rel = path.relative(ROOT, absPath);
  const lines = fs.readFileSync(absPath, "utf8").split("\n");
  const violations: Violation[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (PLURAL_RX.test(lines[i])) {
      violations.push({ file: rel, line: i + 1, text: lines[i].trim() });
    }
  }
  return violations;
}

function main(): number {
  const allFiles = SCAN_TARGETS.flatMap(listFiles);
  const violations = allFiles.flatMap(scanFile);

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scannedFileCount: allFiles.length,
        scanTargets: SCAN_TARGETS.map((t) => t.relPath),
        canonicalNamespace: "/investment",
        forbiddenPattern: PLURAL_RX.toString(),
        violationCount: violations.length,
        violations,
      },
      null,
      2,
    ),
    "utf8",
  );

  if (violations.length > 0) {
    console.error("❌ Plural `/investments/*` route paths detected in canonical surface:");
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line}  ${v.text}`);
    }
    console.error(
      "\nThe canonical Investment Office namespace is `/investment` (singular). " +
        "Legacy `/investments/*` paths must live ONLY in src/routes/redirects/user-redirect-map.ts.",
    );
    console.error(`Report written to ${path.relative(ROOT, REPORT_PATH)}`);
    return 1;
  }

  console.log(
    `✅ Investment route namespace clean — scanned ${allFiles.length} file(s), no plural \`/investments/*\` found.`,
  );
  return 0;
}

process.exit(main());
