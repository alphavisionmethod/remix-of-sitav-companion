/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — 5-Plane Boundary Check (Part 3 reorganization)
//
// Sibling to scripts/architecture/check-plane-boundaries.ts (legacy
// 7-namespace check). This one enforces the canonical 5-plane model:
//   - User plane MUST NOT import from src/planes/admin/ or src/admin/
//   - Admin plane MUST NOT import from user-only domain modules
//
// Soft-fail by default (warnings) — flip to hard-fail after migration.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Violation {
  file: string;
  forbiddenImport: string;
  rule: string;
}

interface BoundaryReport {
  generatedAt: string;
  gate: "5-plane-boundaries";
  filesScanned: number;
  violations: Violation[];
  ok: boolean;
  errorCount: number;
  warningCount: number;
}

const RULES = [
  {
    rule: "user-plane→admin",
    sourceMatchers: [
      /^src\/components\/(business|money|concierge|boardroom)\//,
      /^src\/pages\/(business|money|concierge|boardroom|desktop|workspace)\//,
      /^src\/planes\/product\.ts$/,
      /^src\/planes\/founder\.ts$/,
    ],
    forbiddenImports: [
      /@\/planes\/admin/,
      /@\/admin\//,
      /@\/components\/admin\//,
      /@\/pages\/admin\//,
    ],
  },
  {
    rule: "admin-plane→user-only",
    sourceMatchers: [
      /^src\/admin\//,
      /^src\/components\/admin\//,
      /^src\/pages\/admin\//,
      /^src\/planes\/admin\.ts$/,
    ],
    forbiddenImports: [
      /@\/components\/(business|money|concierge|boardroom)\//,
      /@\/pages\/(business|money|concierge|boardroom|workspace)\//,
    ],
  },
];

const ROOT = "src";
const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const files: string[] = [];
function walk(dir: string) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
}
walk(ROOT);

const violations: Violation[] = [];
const importRe = /(?:import|from)\s+["']([^"']+)["']/g;

for (const file of files) {
  const relative = file.replace(/\\/g, "/");
  let src: string;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const imports: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) imports.push(m[1]);

  for (const rule of RULES) {
    if (!rule.sourceMatchers.some(re => re.test(relative))) continue;
    for (const imp of imports) {
      if (rule.forbiddenImports.some(re => re.test(imp))) {
        violations.push({ file: relative, forbiddenImport: imp, rule: rule.rule });
      }
    }
  }
}

const report: BoundaryReport = {
  generatedAt: new Date().toISOString(),
  gate: "5-plane-boundaries",
  filesScanned: files.length,
  violations: violations.slice(0, 200),
  ok: violations.length === 0,
  errorCount: 0, // soft-fail: count as warnings during migration
  warningCount: violations.length,
};

writeFileSync(
  join(OUT_DIR, "5-plane-boundaries-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(`5-plane-boundaries: scanned ${files.length} files, ${violations.length} violation(s) [warning-level during migration]`);
if (violations.length > 0) {
  console.log("First 10 violations:");
  for (const v of violations.slice(0, 10)) {
    console.log(`  [${v.rule}] ${v.file} → ${v.forbiddenImport}`);
  }
}
process.exit(0);
