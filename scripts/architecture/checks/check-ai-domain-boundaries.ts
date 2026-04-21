/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Domain Boundary Guard (Build-Time)
//
// Enforces that Advisor, Boardroom, and Brain domains do not
// cross-import each other's internal logic. Only shared contracts
// and cross-cutting infrastructure are allowed at boundaries.
//
// Rules:
//   1. Advisor code MUST NOT import Boardroom internals or Brain internals
//   2. Boardroom code MUST NOT import Advisor internals or Brain internals
//   3. Brain code MUST NOT import Advisor internals or Boardroom internals
//   4. All domains MAY import from shared contracts (src/packages/contracts/)
//   5. All domains MAY import from cross-cutting utils (src/lib/utils, etc.)
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

type AIDomain = "advisor" | "boardroom" | "brain";

interface Violation {
  file: string;
  importPath: string;
  sourceDomain: AIDomain;
  targetDomain: AIDomain;
  rule: string;
}

interface BoundaryReport {
  generatedAt: string;
  gate: "ai-domain-boundaries";
  filesScanned: number;
  violations: Violation[];
  ok: boolean;
  errorCount: number;
}

// ── Domain path ownership ──────────────────────────────────────

const DOMAIN_PATHS: Record<AIDomain, RegExp[]> = {
  advisor: [
    /^src\/lib\/advisors\//,
    /^src\/lib\/advisor-intelligence\//,
    /^src\/lib\/advisor-protocol\//,
    /^src\/lib\/services\/advisor-/,
    /^src\/packages\/advisor-/,
    /^src\/components\/advisors\//,
    /^src\/pages\/advisors\//,
    /^src\/features\/advisors\//,
    /^src\/domains\/advisors\//,
  ],
  boardroom: [
    /^src\/lib\/boardroom\//,
    /^src\/lib\/services\/boardroom/,
    /^src\/lib\/hooks\/boardroom\//,
    /^src\/packages\/boardroom-/,
    /^src\/components\/sita\/apps\/boardroom\//,
    /^src\/components\/admin\/boardroom\//,
    /^src\/pages\/boardroom\//,
    /^src\/features\/boardroom\//,
    /^src\/domains\/boardroom\//,
  ],
  brain: [
    /^src\/lib\/core-services\/brain-core\//,
    /^src\/lib\/services\/brain-core\//,
    /^src\/lib\/ai-platform\//,
  ],
};

// Import patterns that map to each domain (used to detect cross-imports)
const IMPORT_DOMAIN_PATTERNS: Record<AIDomain, RegExp[]> = {
  advisor: [
    /@\/lib\/advisors\//,
    /@\/lib\/advisor-intelligence\//,
    /@\/lib\/advisor-protocol\//,
    /@\/lib\/services\/advisor-/,
    /@\/packages\/advisor-(?!.*contracts)/,  // contracts are shared
  ],
  boardroom: [
    /@\/lib\/boardroom\//,
    /@\/lib\/services\/boardroom/,
    /@\/lib\/hooks\/boardroom\//,
    /@\/packages\/boardroom-(?!.*contracts)/, // contracts are shared
  ],
  brain: [
    /@\/lib\/core-services\/brain-core\//,
    /@\/lib\/services\/brain-core\//,
    /@\/lib\/ai-platform\/(?!types|contracts)/,
  ],
};

// Allowed cross-domain imports (shared contracts layer)
const ALLOWED_CROSS_IMPORTS: RegExp[] = [
  /@\/packages\/contracts\//,
  /@\/packages\/advisor-runtime-contracts/,
  /@\/packages\/boardroom-contracts/,
  /@\/lib\/architecture\//,
  /@\/lib\/utils/,
  /@\/integrations\//,
];

// ── Forbidden boundary matrix ──────────────────────────────────
// Key = source domain, Value = domains that source MUST NOT import from
const FORBIDDEN_IMPORTS: Record<AIDomain, AIDomain[]> = {
  advisor: ["boardroom", "brain"],
  boardroom: ["advisor", "brain"],
  brain: ["advisor", "boardroom"],
};

// ── File scanner ───────────────────────────────────────────────

function collectTSFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectTSFiles(full, files);
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

function classifyFile(relPath: string): AIDomain | null {
  for (const [domain, patterns] of Object.entries(DOMAIN_PATHS) as [AIDomain, RegExp[]][]) {
    if (patterns.some(p => p.test(relPath))) return domain;
  }
  return null;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRe = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function isAllowedCrossImport(importPath: string): boolean {
  return ALLOWED_CROSS_IMPORTS.some(p => p.test(importPath));
}

function classifyImport(importPath: string): AIDomain | null {
  for (const [domain, patterns] of Object.entries(IMPORT_DOMAIN_PATTERNS) as [AIDomain, RegExp[]][]) {
    if (patterns.some(p => p.test(importPath))) return domain;
  }
  return null;
}

// ── Main ───────────────────────────────────────────────────────

function main() {
  const root = process.cwd();
  const srcDir = join(root, "src");
  const allFiles = collectTSFiles(srcDir);
  const violations: Violation[] = [];
  let scanned = 0;

  for (const file of allFiles) {
    const relPath = relative(root, file).replace(/\\/g, "/");
    const sourceDomain = classifyFile(relPath);
    if (!sourceDomain) continue;

    scanned++;
    const content = readFileSync(file, "utf-8");
    const imports = extractImports(content);
    const forbidden = FORBIDDEN_IMPORTS[sourceDomain];

    for (const imp of imports) {
      if (isAllowedCrossImport(imp)) continue;

      const targetDomain = classifyImport(imp);
      if (targetDomain && forbidden.includes(targetDomain)) {
        violations.push({
          file: relPath,
          importPath: imp,
          sourceDomain,
          targetDomain,
          rule: `${sourceDomain}→${targetDomain} boundary violation`,
        });
      }
    }
  }

  const report: BoundaryReport = {
    generatedAt: new Date().toISOString(),
    gate: "ai-domain-boundaries",
    filesScanned: scanned,
    violations,
    ok: violations.length === 0,
    errorCount: violations.length,
  };

  // Write report
  const outDir = join(root, "generated");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "ai-domain-boundary-report.json"), JSON.stringify(report, null, 2));

  // Console output
  console.log(`\n🧠 AI Domain Boundary Check`);
  console.log(`   Files scanned: ${scanned}`);

  if (violations.length === 0) {
    console.log(`   ✅ No boundary violations found.\n`);
    process.exit(0);
  }

  console.log(`   ❌ ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.log(`   [${v.rule}]`);
    console.log(`     File:   ${v.file}`);
    console.log(`     Import: ${v.importPath}\n`);
  }

  // Soft-fail for now (exit 0) — flip to exit(1) when migration complete
  const hardFail = process.argv.includes("--strict");
  if (hardFail) {
    console.log("   ⛔ --strict mode: failing build.\n");
    process.exit(1);
  } else {
    console.log("   ⚠️  Soft-fail mode. Pass --strict to block.\n");
    process.exit(0);
  }
}

main();