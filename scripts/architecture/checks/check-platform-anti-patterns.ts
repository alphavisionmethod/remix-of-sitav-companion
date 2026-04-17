#!/usr/bin/env node
// SITA OS — Phase 5 Anti-Pattern Detection
// Enforces: zero tolerance for `as any` in src/pages/** (ISS-020 / OPN-P2-04)
//           soft cap (>3 occurrences) for `src/lib/services/**`
import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();

const ANTI_PATTERNS = [
  { pattern: /\bas\s+any\b/, name: "as-any", detail: "Explicit 'as any' type cast" },
  { pattern: /\/\/\s*@ts-ignore/, name: "ts-ignore", detail: "@ts-ignore suppression" },
  { pattern: /\/\/\s*@ts-nocheck/, name: "ts-nocheck", detail: "@ts-nocheck suppression" },
  { pattern: /console\.(log|debug)\(/, name: "console-log", detail: "console.log in production code" },
];

// ─────────────────────────────────────────────────────────────
// Pages layer — zero tolerance (ISS-020 / OPN-P2-04)
// ─────────────────────────────────────────────────────────────
const pageFiles = [
  ...scanDir("src/pages", [".ts", ".tsx"]),
];
for (const file of pageFiles) {
  if (file.includes(".test.") || file.includes(".spec.")) continue;
  const content = readFileContent(file);
  for (const { pattern, name, detail } of ANTI_PATTERNS) {
    const matches = content.match(new RegExp(pattern.source, "g"));
    if (matches && matches.length > 0) {
      vc.add(file, name, `${detail} (${matches.length} occurrences) — pages layer must have zero`, "error");
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Services layer — soft cap (existing behavior preserved)
// ─────────────────────────────────────────────────────────────
const serviceFiles = scanDir("src/lib/services", [".ts"]);
for (const file of serviceFiles) {
  if (file.includes(".test.") || file.includes(".spec.")) continue;
  const content = readFileContent(file);
  for (const { pattern, name, detail } of ANTI_PATTERNS) {
    const matches = content.match(new RegExp(pattern.source, "g"));
    if (matches && matches.length > 3) {
      vc.add(file, name, `${detail} (${matches.length} occurrences)`, "warning");
    }
  }
}

vc.report("check-platform-anti-patterns");
vc.exitIfErrors();
