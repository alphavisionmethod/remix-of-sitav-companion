// ═══════════════════════════════════════════════════════════════
// SITA OS — Check No Hidden Executor
// CI: Assert files outside execution layer don't call executors
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const EXECUTION_DIR = "src/lib/orchestration/execution";
const SCAN_DIRS = ["src/hooks", "src/pages", "src/components", "src/lib/services"];
const EXECUTOR_PATTERNS = [
  /ExecutorService\s*\(/,
  /\.execute\s*\(\s*\{[^}]*capabilityId/,
  /executeConnector\s*\(/,
  /dispatchJob\s*\(/,
];

const ALLOWED_FILES = [
  "orchestration-facade.ts",
  "execution-orchestrator.ts",
];

let violations = 0;

function scanFile(filePath: string): void {
  if (filePath.includes(EXECUTION_DIR)) return;
  if (ALLOWED_FILES.some(f => filePath.endsWith(f))) return;
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) return;
    for (const pattern of EXECUTOR_PATTERNS) {
      if (pattern.test(line)) {
        console.warn(`[VIOLATION] ${filePath}:${i + 1} — direct executor call outside execution layer`);
        violations++;
        break;
      }
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
  console.error(`\n❌ ${violations} hidden executor violations. Only the execution layer may call executors.`);
} else {
  console.log("✅ No hidden executor check passed.");
}

process.exit(violations > 0 ? 1 : 0);
