#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Check: Misplaced Domain Logic in Platform
// Flags business-context terminology inside src/platform/* (which
// must remain bounded-context-agnostic).
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();
const files = scanDir("src/platform", [".ts", ".tsx"]);
// Heuristic: imports from @/domains/* inside platform = forbidden
const RE = /from\s+['"]@\/domains\/[^'"]+['"]/;

let hits = 0;
for (const f of files) {
  const content = readFileContent(f);
  if (RE.test(content)) {
    hits++;
    vc.add(f, "misplaced-domain-logic",
      "Platform code imports from @/domains/*. Platform must remain domain-agnostic; invert the dependency or expose an extension point.",
      "warning");
  }
}
console.log(`  🏛  Scanned ${files.length} platform files, ${hits} forbidden domain imports`);
vc.report("check-misplaced-domain-logic");
vc.exitIfErrors();
