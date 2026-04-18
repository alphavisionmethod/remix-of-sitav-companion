#!/usr/bin/env node
// SITA OS — Consumer Rewire Wave 2
// Rewires the second batch of consumers to their canonical homes after Wave 2 migration.

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve("src");

const REWIRE_MAP: Record<string, string> = {
  // demo-data
  "@/lib/demo-data/admin-platform": "@/data/seed/admin-platform",
  "@/lib/demo-data/revenue-office": "@/data/seed/revenue-office",
  "@/lib/demo-data/core-pages": "@/data/seed/core-pages",
  "@/lib/demo-data/digital-presence": "@/data/seed/digital-presence",
  "@/lib/demo-data/integrations": "@/data/seed/integrations",
  "@/lib/demo-data/admin-intelligence": "@/data/seed/admin-intelligence",
  "@/lib/demo-data/atlas": "@/data/seed/atlas",
  "@/lib/demo-data/approval-chamber": "@/data/seed/approval-chamber",
  "@/lib/demo-data/app-receipts": "@/data/seed/app-receipts",
  "@/lib/demo-data/apps": "@/data/seed/apps",
  "@/lib/demo-data/business": "@/data/seed/business",
  "@/lib/demo-data/calendar-workspace": "@/data/seed/calendar-workspace",
  "@/lib/demo-data/communications": "@/data/seed/communications",
  "@/lib/demo-data/concierge": "@/data/seed/concierge",
  "@/lib/demo-data/connectors": "@/data/seed/connectors",
  "@/lib/demo-data/durability": "@/data/seed/durability",
  "@/lib/demo-data/enterprise": "@/data/seed/enterprise",
  "@/lib/demo-data/health-signals": "@/data/seed/health-signals",
  "@/lib/demo-data/import-export": "@/data/seed/import-export",
  "@/lib/demo-data/incidents": "@/data/seed/incidents",
  "@/lib/demo-data/media": "@/data/seed/media",
  "@/lib/demo-data/native-shell": "@/data/seed/native-shell",
  "@/lib/demo-data/notes": "@/data/seed/notes",
  "@/lib/demo-data/notification-calm": "@/data/seed/notification-calm",
  "@/lib/demo-data/outcome-engine": "@/data/seed/outcome-engine",
  "@/lib/demo-data/owner-center-costs": "@/data/seed/owner-center-costs",
  "@/lib/demo-data/packs": "@/data/seed/packs",
  "@/lib/demo-data/system-status": "@/data/seed/system-status",
  "@/lib/demo-data/investment": "@/data/seed/investment",

  // design-system
  "@/lib/design-system/sita-design-tokens": "@/platform/design-system/sita-design-tokens",
  "@/lib/design-system/app-window-system": "@/platform/design-system/app-window-system",
  "@/lib/design-system/nova-os": "@/platform/design-system/nova-os",
  "@/lib/design-system/domain-atmospheres": "@/platform/design-system/domain-atmospheres",
  "@/lib/design-system/snap-zones": "@/platform/design-system/snap-zones",

  // data-services
  "@/lib/data-services/crm-data-service": "@/data/repositories/crm-data-service",
  "@/lib/data-services/file-explorer-service": "@/data/repositories/file-explorer-service",

  // customer-journey
  "@/lib/customer-journey/journey-registry": "@/domains/customer-journey/journey-registry",
  "@/lib/customer-journey/journey-hooks": "@/domains/customer-journey/journey-hooks",
  "@/lib/customer-journey/journey-ingestion-hooks": "@/domains/customer-journey/journey-ingestion-hooks",
  "@/lib/customer-journey/journey-scoring-hooks": "@/domains/customer-journey/journey-scoring-hooks",
  "@/lib/customer-journey/journey-coverage-hooks": "@/domains/customer-journey/journey-coverage-hooks",
  "@/lib/customer-journey/journey-evidence-hooks": "@/domains/customer-journey/journey-evidence-hooks",
  "@/lib/customer-journey/ai-journey-classifier": "@/domains/customer-journey/ai-journey-classifier",
  "@/lib/customer-journey/blocker-scoring-engine": "@/domains/customer-journey/blocker-scoring-engine",
  "@/lib/customer-journey/journey-registry-seeder": "@/domains/customer-journey/journey-registry-seeder",

  // investment-office
  "@/lib/investment-office/mock-data": "@/domains/investment/mock-data",

  // cloud-backbone
  "@/lib/cloud-backbone/cloud-storage-service": "@/platform/cloud/cloud-storage-service",
  "@/lib/cloud-backbone/cloud-lifecycle-service": "@/platform/cloud/cloud-lifecycle-service",
  "@/lib/cloud-backbone/cloud-abuse-service": "@/platform/cloud/cloud-abuse-service",
  "@/lib/cloud-backbone/cloud-audit-service": "@/platform/cloud/cloud-audit-service",
  "@/lib/cloud-backbone/cloud-device-service": "@/platform/cloud/cloud-device-service",
  "@/lib/cloud-backbone/cloud-quota-service": "@/platform/cloud/cloud-quota-service",
  "@/lib/cloud-backbone/cloud-support-service": "@/platform/cloud/cloud-support-service",
  "@/lib/cloud-backbone/cloud-sync-service": "@/platform/cloud/cloud-sync-service",
  "@/lib/cloud-backbone/cloud-tenant-service": "@/platform/cloud/cloud-tenant-service",
  "@/lib/cloud-backbone/cloud-worker-service": "@/platform/cloud/cloud-worker-service",

  // reality-audit
  "@/lib/reality-audit/reality-audit-registry": "@/runtimes/reality/reality-audit-registry",

  // platform-law
  "@/lib/platform-law/platform-law-registry": "@/platform/governance/platform-law-registry",

  // integrations
  "@/lib/integrations/reality-integration-hub": "@/integrations/external/reality-integration-hub",
};

function targetExists(canonical: string): boolean {
  const rel = canonical.replace(/^@\//, "");
  const candidates = [
    path.join("src", `${rel}.ts`),
    path.join("src", `${rel}.tsx`),
    path.join("src", rel, "index.ts"),
    path.join("src", rel, "index.tsx"),
  ];
  return candidates.some(p => fs.existsSync(p));
}

const validatedMap: Record<string, string> = {};
for (const [from, to] of Object.entries(REWIRE_MAP)) {
  if (targetExists(to)) validatedMap[from] = to;
  else console.warn(`⚠ skip ${from} → ${to} (target missing)`);
}

console.log(`Validated rewires: ${Object.keys(validatedMap).length}/${Object.keys(REWIRE_MAP).length}`);

const stats: Record<string, number> = {};
let filesTouched = 0;

function walk(dir: string, fn: (p: string) => void) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (p.includes(`${path.sep}lib${path.sep}`) || p.endsWith(`${path.sep}lib`)) continue;
      walk(p, fn);
    } else if (/\.(ts|tsx)$/.test(e)) fn(p);
  }
}

walk(ROOT, (file) => {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of Object.entries(validatedMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(from\\s+['"])${escaped}(['"])`, "g");
    const re2 = new RegExp(`(import\\s*\\(\\s*['"])${escaped}(['"])`, "g");
    let count = 0;
    src = src.replace(re, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    src = src.replace(re2, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    if (count > 0) {
      stats[from] = (stats[from] || 0) + count;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, src);
    filesTouched++;
  }
});

const total = Object.values(stats).reduce((s, n) => s + n, 0);
console.log(`\n✅ Rewired ${total} import sites across ${filesTouched} files\n`);
const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
for (const [k, n] of sorted) console.log(`  ${String(n).padStart(4)}  ${k}`);

fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/consumer-rewire-wave2-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRewireSites: total,
    filesTouched,
    perPath: stats,
    validatedMap,
  }, null, 2),
);
console.log(`\nReport: generated/lib-decomposition/consumer-rewire-wave2-report.json`);
