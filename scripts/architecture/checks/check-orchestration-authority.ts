// ═══════════════════════════════════════════════════════════════
// SITA OS — Check Orchestration Authority
// CI: Assert only 4 canonical orchestrators own authority
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const CANONICAL_ORCHESTRATION_DIR = "src/lib/orchestration";
const SCAN_DIRS = ["src/lib/services", "src/lib/core-services", "src/hooks", "src/pages"];
const ORCHESTRATION_VERBS = /\b(orchestrate|orchestrating|orchestration_authority|dispatchExecution|executePlan|writeProof)\b/i;

const ALLOWED_FILES = [
  "canonical-chain-orchestrator.ts",  // legacy, delegates to facade
  "intent-orchestrator.ts",           // inside canonical dir is fine
  "orchestration-facade.ts",
];

let violations = 0;

function scanFile(filePath: string): void {
  if (filePath.includes(CANONICAL_ORCHESTRATION_DIR)) return;
  if (ALLOWED_FILES.some(f => filePath.endsWith(f))) return;
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    if (ORCHESTRATION_VERBS.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("*")) {
      // Allow type-only references
      if (line.includes("type ") || line.includes("interface ") || line.includes("export type")) return;
      console.warn(`[VIOLATION] ${filePath}:${i + 1} — orchestration verb in non-canonical file`);
      violations++;
    }
  });
}

function scanDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanDir(full);
    else scanFile(full);
  }
}

SCAN_DIRS.forEach(scanDir);

if (violations > 0) {
  console.error(`\n❌ ${violations} orchestration authority violations found.`);
  console.error("Only files in src/lib/orchestration/ may own orchestration authority.");
} else {
  console.log("✅ Orchestration authority check passed — no violations.");
}

process.exit(violations > 0 ? 1 : 0);
