/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Mock Provider Leak (Phase 9)
// Fails if any production page is wired to mock-only providers.
// Allows the documented "live with honest demo fallback" pattern:
// importing from mock-data/ is OK iff the same file also imports
// at least one real-data path (hook, service, or supabase client).
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const PAGES_DIR = "src/pages";

const HARD_FORBIDDEN = [
  "useDemoData",
  "MockProvider",
  "DemoProvider",
  "/mocks/",
  "createMockClient",
];

const SOFT_FORBIDDEN = ["mock-data/"];
const REAL_DATA_MARKERS = [
  "@/hooks/use-",
  "@/modules/business/hooks/useBusinessProfile",
  "@/hooks/useCurrentOrg",
  "@/integrations/supabase/client",
  "@/lib/services/",
  "@/lib/data-services/",
  "@/lib/capabilities",
  "supabase.from(",
  "supabase.functions.invoke",
];

const ALLOWED_PAGE_PATTERNS = [
  "src/pages/admin/META",
  "src/pages/admin/CI01CIUmbrellaCenter",
];

interface Leak {
  file: string;
  line: number;
  match: string;
  reason: string;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

const hardLeaks: Leak[] = [];
const allowedFallbacks: Leak[] = [];

for (const file of walk(PAGES_DIR)) {
  if (ALLOWED_PAGE_PATTERNS.some((p) => file.startsWith(p))) continue;
  if (file.includes("__tests__") || file.endsWith(".test.tsx") || file.endsWith(".test.ts")) continue;
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const hasRealDataPath = REAL_DATA_MARKERS.some((m) => content.includes(m));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("import") && !line.includes("from ")) continue;

    for (const forbidden of HARD_FORBIDDEN) {
      if (line.includes(forbidden)) {
        hardLeaks.push({ file, line: i + 1, match: forbidden, reason: "hard-forbidden mock provider" });
      }
    }
    for (const forbidden of SOFT_FORBIDDEN) {
      if (line.includes(forbidden)) {
        if (hasRealDataPath) {
          allowedFallbacks.push({
            file, line: i + 1, match: forbidden,
            reason: "demo fallback alongside real-data path (allowed)",
          });
        } else {
          hardLeaks.push({
            file, line: i + 1, match: forbidden,
            reason: "imports mock-data without any real-data hook/service in same file",
          });
        }
      }
    }
  }
}

const out = "generated/mock-leak-report.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  hardLeaks,
  allowedFallbacks,
  ok: hardLeaks.length === 0,
}, null, 2), "utf-8");

console.log(`Mock-leak scan: ${hardLeaks.length} hard violations, ${allowedFallbacks.length} allowed demo-fallback uses`);
console.log(`  → ${out}`);

if (hardLeaks.length > 0) {
  console.error("❌ Mock provider leaks in production pages:");
  for (const l of hardLeaks) {
    console.error(`   - ${l.file}:${l.line} '${l.match}' — ${l.reason}`);
  }
  process.exit(1);
}
console.log("✅ Pass");
