#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Build-Time Demo/Mock Leak Detector
//
// Fails the build if production source files contain direct
// MOCK_/DEMO_ usage that is NOT behind isDemoMode gating or
// safe patterns (imports, type annotations, empty-array casts).
// ═══════════════════════════════════════════════════════════════
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const SRC = "src";

// Directories to skip entirely
const SKIP_DIRS = new Set([
  "__tests__", "test", "tests", "fixtures", "seed", "mock-data",
  "website-demo", "storybook", "stories", "__mocks__",
]);

// File name patterns to skip
const SKIP_FILE_RE = /\.(test|spec)\.(ts|tsx)$|test-utils|demo-policy|demo-mode|use-demo|DemoMode/;

// Path segments that indicate data-definition files (allowed to define DEMO_ constants)
const DATA_PATH_RE = /\bdata\/|constants\/|config\/|seed\/|fixtures\//;

// The regex that finds MOCK_/DEMO_ references
const LEAK_RE = /\b(MOCK_|DEMO_)[A-Z_]{2,}/g;

// Safe line patterns — if a line matches any of these, it's not a violation
const SAFE_LINE_PATTERNS = [
  /^\s*\/\//, // comment
  /^\s*\/?\*/, // block comment
  /^\s*\*/, // block comment continuation
  /^\s*import\s/, // import statement
  /^\s*import\s+type/, // import type
  /^\s*(interface|type)\s/, // type definitions
  /as\s+typeof\s+(MOCK_|DEMO_)/, // typeof cast
  /\(\[\]\s*as\s*typeof\s+(MOCK_|DEMO_)/, // empty array cast
  /isDemoMode/, // gated behind demo mode
  /isDemo/, // gated behind demo check
  /["'`].*\b(MOCK_|DEMO_).*["'`]/, // inside string literal
];

function* walkTs(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkTs(join(dir, entry.name));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

const violations = [];

for (const filePath of walkTs(SRC)) {
  const rel = relative(".", filePath);
  if (SKIP_FILE_RE.test(rel)) continue;
  if (DATA_PATH_RE.test(rel)) continue;

  let content;
  try { content = readFileSync(filePath, "utf8"); } catch { continue; }

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!LEAK_RE.test(line)) continue;
    LEAK_RE.lastIndex = 0; // reset

    // Check if line matches any safe pattern
    if (SAFE_LINE_PATTERNS.some(p => p.test(line))) continue;

    violations.push({ file: rel, line: i + 1, text: line.trim().slice(0, 120) });
  }
}

if (violations.length > 0) {
  // ── Ratchet mode ──────────────────────────────────────────────
  // Baseline: 603 violations as of 2026-04-22 (v4.1 audit).
  // The count must NEVER increase. Decrease = progress.
  const BASELINE = 603;

  console.log(`⚠️  DEMO/MOCK LEAK DETECTOR: ${violations.length} violation(s) (baseline: ${BASELINE})`);

  if (violations.length > BASELINE) {
    console.error(`\n🚫 REGRESSION: violation count increased from ${BASELINE} → ${violations.length}\n`);
    for (const v of violations.slice(0, 30)) {
      console.error(`  ${v.file}:${v.line}: ${v.text}`);
    }
    if (violations.length > 30) {
      console.error(`  ... and ${violations.length - 30} more`);
    }
    console.error("\nFix: Gate demo data behind isDemoMode or use ([] as typeof DEMO_X) pattern.");
    process.exit(1);
  } else if (violations.length < BASELINE) {
    console.log(`✅ Progress! Reduced from ${BASELINE} → ${violations.length} (${BASELINE - violations.length} fixed)`);
    console.log("   Update BASELINE in check-demo-leaks.mjs to lock in progress.");
    process.exit(0);
  } else {
    console.log("   No regression. Reduce this count by gating MOCK_/DEMO_ behind isDemoMode.");
    process.exit(0);
  }
} else {
  console.log("✅ No direct MOCK_/DEMO_ leaks in production source files");
  process.exit(0);
}