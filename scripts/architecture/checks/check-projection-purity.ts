#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Projection Purity Check
// Asserts L4 projection services are READ-ONLY.
// Projections must not:
//   • call supabase mutations (.insert/.update/.delete/.upsert)
//   • emit receipts/proofs
//   • call executor / approval-engine
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();

const projectionFiles = [
  ...scanDir("src/lib/core-services/projection-service", [".ts"]),
  ...scanDir("src/lib/services/projection-service", [".ts"]),
].filter(f => !f.includes("__tests__"));

const mutationPatterns: Array<[RegExp, string]> = [
  [/\.insert\s*\(/, "supabase-insert"],
  [/\.update\s*\(/, "supabase-update"],
  [/\.delete\s*\(/, "supabase-delete"],
  [/\.upsert\s*\(/, "supabase-upsert"],
  [/from\s+["']@\/lib\/core-services\/executor/, "executor-import"],
  [/from\s+["']@\/lib\/core-services\/receipt-service/, "receipt-import"],
  [/from\s+["']@\/lib\/core-services\/approval-engine/, "approval-import"],
];

for (const file of projectionFiles) {
  const content = readFileContent(file);
  for (const [pattern, rule] of mutationPatterns) {
    if (pattern.test(content)) {
      vc.add(file, `projection-impurity-${rule}`, `projection contains forbidden ${rule}`, "error");
    }
  }
}

console.log(`  📊 scanned ${projectionFiles.length} projection file(s)`);
vc.report("check-projection-purity");
vc.exitIfErrors();
