#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Check: Misplaced Runtime Logic
// Flags imports from @/runtimes/* inside src/domains/* — domains
// should never depend on runtime substrates directly.
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();
const files = scanDir("src/domains", [".ts", ".tsx"]);
const RE = /from\s+['"]@\/runtimes\/[^'"]+['"]/;

for (const f of files) {
  const content = readFileContent(f);
  if (RE.test(content)) {
    vc.add(f, "misplaced-runtime-import",
      "Domain code imports from @/runtimes/*. Use platform extension points or contracts instead.",
      "warning");
  }
}
console.log(`  🌐 Scanned ${files.length} domain files`);
vc.report("check-misplaced-runtime-logic");
vc.exitIfErrors();
