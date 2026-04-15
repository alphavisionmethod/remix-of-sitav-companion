// ═══════════════════════════════════════════════════════════════
// SITA OS — Check Hook Purity
// CI: Assert hooks don't import orchestration internals
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const HOOKS_DIR = "src/hooks";
const FORBIDDEN_IMPORTS = [
  "@/lib/orchestration/intent/",
  "@/lib/orchestration/planning/",
  "@/lib/orchestration/execution/",
  "@/lib/orchestration/proof/",
  "@/lib/orchestration/shared/",
];

const ALLOWED_IMPORTS = [
  "@/lib/orchestration",          // barrel
  "@/lib/orchestration/index",    // explicit barrel
  "@/lib/orchestration/orchestration-facade",  // facade direct
];

let violations = 0;

function checkFile(filePath: string): void {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, i) => {
    if (!line.includes("import ") && !line.includes("from ")) return;

    for (const forbidden of FORBIDDEN_IMPORTS) {
      if (line.includes(forbidden)) {
        // Check if it's an allowed import
        const isAllowed = ALLOWED_IMPORTS.some(a => line.includes(a));
        if (!isAllowed) {
          console.warn(`[VIOLATION] ${filePath}:${i + 1} — hook imports orchestration internal: ${forbidden}`);
          violations++;
        }
      }
    }
  });
}

if (fs.existsSync(HOOKS_DIR)) {
  for (const entry of fs.readdirSync(HOOKS_DIR, { withFileTypes: true })) {
    if (entry.isFile()) checkFile(path.join(HOOKS_DIR, entry.name));
  }
}

if (violations > 0) {
  console.error(`\n❌ ${violations} hook purity violations. Hooks must only import from orchestration facade/barrel.`);
} else {
  console.log("✅ Hook purity check passed — no forbidden orchestration imports.");
}

process.exit(violations > 0 ? 1 : 0);
