/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Page Registry Completeness (Phase 10)
// Walks src/pages/**/*.tsx, classifies each page, and fails if
// any *critical* page is missing from the page-state registry.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PAGE_STATE_REGISTRY } from "../../../src/lib/reality/page-state-registry";

const PAGES_ROOT = "src/pages";
const REPORT_PATH = "generated/page-registry-completeness-report.json";

type Bucket = "critical" | "admin" | "internal" | "dev";

const CRITICAL_PAGE_FILES = new Set<string>([
  // Top-level core flows that absolutely must be registered.
  "src/pages/Boardroom.tsx",
  "src/pages/BusinessCenter.tsx",
  "src/pages/ConciergeCenter.tsx",
  "src/pages/CommunicationsPage.tsx",
  "src/pages/DesktopPage.tsx",
  "src/pages/HomePage.tsx",
  "src/pages/MoneyCenter.tsx",
  "src/pages/MissionControl.tsx",
  "src/pages/InvestmentOffice.tsx",
  "src/pages/AuthPage.tsx",
  "src/pages/Login.tsx",
  "src/pages/SignUp.tsx",
]);

function classifyPage(file: string): Bucket {
  if (file.startsWith("src/pages/admin/")) return "admin";
  if (file.startsWith("src/pages/owner/")) return "internal";
  if (file.startsWith("src/pages/dev/") || file.includes("/__")) return "dev";
  if (file.startsWith("src/pages/internal/")) return "internal";
  if (CRITICAL_PAGE_FILES.has(file)) return "critical";
  return "internal";
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const allPages = walk(PAGES_ROOT).sort();
const registered = new Set(PAGE_STATE_REGISTRY.map((e) => e.file));

const buckets: Record<Bucket, string[]> = { critical: [], admin: [], internal: [], dev: [] };
for (const p of allPages) buckets[classifyPage(p)].push(p);

const orphanCritical = buckets.critical.filter((p) => !registered.has(p));
const ghostsRegistered = [...registered].filter((p) => !allPages.includes(p));

const report = {
  generatedAt: new Date().toISOString(),
  totalOnDisk: allPages.length,
  countsByBucket: {
    critical: buckets.critical.length,
    admin: buckets.admin.length,
    internal: buckets.internal.length,
    dev: buckets.dev.length,
  },
  registered: registered.size,
  orphanCritical,
  ghostsRegistered,
  ok: orphanCritical.length === 0 && ghostsRegistered.length === 0,
};

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`Pages on disk: ${allPages.length} (critical=${buckets.critical.length}, admin=${buckets.admin.length}, internal=${buckets.internal.length}, dev=${buckets.dev.length})`);
console.log(`Registered: ${registered.size}`);

if (orphanCritical.length > 0) {
  console.error(`❌ ${orphanCritical.length} critical pages missing from page-state registry:`);
  for (const p of orphanCritical) console.error(`   - ${p}`);
}
if (ghostsRegistered.length > 0) {
  console.error(`❌ ${ghostsRegistered.length} registered pages not present on disk:`);
  for (const p of ghostsRegistered) console.error(`   - ${p}`);
}

if (!report.ok) process.exit(1);
console.log("✅ Pass");
