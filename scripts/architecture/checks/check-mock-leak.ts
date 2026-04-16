/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Mock Provider Leak (Phase 9)
// Fails if any production page imports a demo/mock provider.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PAGES_DIR = "src/pages";
const FORBIDDEN_IMPORTS = [
  "useDemoData",
  "MockProvider",
  "DemoProvider",
  "mock-data/",
  "/mocks/",
  "createMockClient",
];

// Pages that are explicitly allowed to reference demo providers
// (e.g., the Demo banner / DemoStateBanner reality components)
const ALLOWED_PAGE_PATTERNS = [
  "src/pages/admin/META",
  "src/pages/admin/CI01CIUmbrellaCenter",
];

interface Leak {
  file: string;
  line: number;
  match: string;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const leaks: Leak[] = [];
for (const file of walk(PAGES_DIR)) {
  if (ALLOWED_PAGE_PATTERNS.some((p) => file.startsWith(p))) continue;
  if (file.includes("__tests__") || file.endsWith(".test.tsx") || file.endsWith(".test.ts")) continue;
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("import") && !line.includes("from ")) continue;
    for (const forbidden of FORBIDDEN_IMPORTS) {
      if (line.includes(forbidden)) {
        leaks.push({ file, line: i + 1, match: forbidden });
      }
    }
  }
}

console.log(`Mock-leak scan: ${leaks.length} forbidden imports`);
if (leaks.length > 0) {
  console.error("❌ Mock provider leaks in production pages:");
  for (const l of leaks) {
    console.error(`   - ${l.file}:${l.line} imports '${l.match}'`);
  }
  process.exit(1);
}
console.log("✅ Pass");
