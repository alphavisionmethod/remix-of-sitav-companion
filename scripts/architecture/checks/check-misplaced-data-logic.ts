#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Check: Misplaced Data Logic
// Flags raw supabase/db client imports outside src/data/, src/integrations/,
// and edge functions. Hooks/components/pages must go through repositories.
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();
const ALLOWED_PREFIXES = ["src/data/", "src/integrations/", "supabase/functions/", "src/lib/"];
const SUSPECT = /from\s+['"]@\/integrations\/supabase\/client['"]/;

const dirs = ["src/pages", "src/components", "src/hooks", "src/contexts", "src/features", "src/planes", "src/domains", "src/platform"];
let total = 0, hits = 0;
for (const d of dirs) {
  const files = scanDir(d, [".ts", ".tsx"]);
  total += files.length;
  for (const f of files) {
    if (ALLOWED_PREFIXES.some(p => f.includes(p))) continue;
    const content = readFileContent(f);
    if (SUSPECT.test(content)) {
      hits++;
      vc.add(f, "misplaced-data-logic",
        "Direct supabase client import outside src/data/ or src/integrations/. Use a repository in src/data/repositories instead.",
        "warning");
    }
  }
}
console.log(`  💾 Scanned ${total} files, ${hits} potential data-logic leaks`);
vc.report("check-misplaced-data-logic");
vc.exitIfErrors();
