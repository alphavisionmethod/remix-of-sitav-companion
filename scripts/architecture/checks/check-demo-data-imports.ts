#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Import Governance Check
// Flags any page or component that imports from
//   @/lib/demo-data | @/lib/mock-data | @/lib/demo-scenarios
// without also referencing useDataMode / useDemoMode / useAuth().isDemo.
// This guarantees runtime mode enforcement at every consumer site.
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOTS = ["src/pages", "src/components"];
const DEMO_IMPORT_RE = /from ["']@\/lib\/(demo-data|mock-data|demo-scenarios)/;
const MODE_GATE_RE = /(useDataMode|useDemoMode|isDemoMode|useAuth\(\)\.isDemo|useRealityMode)/;

// Files explicitly allowed to import demo data without a gate
// (e.g. demo-only display components, hook implementations that themselves do the gating).
const ALLOWLIST = new Set<string>([
  "src/hooks/useInvestmentOfficeData.ts",
  "src/hooks/useDesktopWidgetsData.ts",
  "src/components/sita/DemoGovernanceBanner.tsx",
  "src/components/sita/DemoModeBadge.tsx",
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const full = join(dir, e);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

const violations: { file: string; reason: string }[] = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (ALLOWLIST.has(file)) continue;
    let content: string;
    try { content = readFileSync(file, "utf-8"); } catch { continue; }
    if (!DEMO_IMPORT_RE.test(content)) continue;
    if (!MODE_GATE_RE.test(content)) {
      violations.push({ file, reason: "imports demo-data without a runtime mode gate" });
    }
  }
}

if (violations.length > 0) {
  console.error(`❌ Demo data import governance violations: ${violations.length}`);
  for (const v of violations) console.error(`   ${v.file} — ${v.reason}`);
  process.exit(1);
} else {
  console.log("✅ All demo-data importers use a runtime mode gate");
}
