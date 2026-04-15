#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Rewriter (Complete)
// Rewrites @/ imports to @sita/ workspace imports after migration.
// Run: npx tsx scripts/migrate/rewrite-imports.ts [--dry-run]
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const DRY_RUN = process.argv.includes("--dry-run");

const IMPORT_MAP: Array<{ pattern: RegExp; replacement: string }> = [
  // ── Shared contracts ──
  { pattern: /from\s+["']@\/packages\/contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts$1"' },
  { pattern: /from\s+["']@\/packages\/business-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/business$1"' },
  { pattern: /from\s+["']@\/packages\/finance-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/finance$1"' },
  { pattern: /from\s+["']@\/packages\/concierge-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/concierge$1"' },
  { pattern: /from\s+["']@\/packages\/boardroom-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/boardroom$1"' },
  { pattern: /from\s+["']@\/packages\/enterprise-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/enterprise$1"' },
  { pattern: /from\s+["']@\/packages\/moat-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/moat$1"' },
  { pattern: /from\s+["']@\/packages\/policy-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/policy$1"' },
  { pattern: /from\s+["']@\/packages\/proof-model(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/proof$1"' },
  { pattern: /from\s+["']@\/packages\/reality-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/reality$1"' },
  { pattern: /from\s+["']@\/packages\/audit-contracts(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/audit$1"' },
  { pattern: /from\s+["']@\/packages\/protocols(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/protocols$1"' },
  { pattern: /from\s+["']@\/packages\/shell-grammar(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/shell-grammar$1"' },
  { pattern: /from\s+["']@\/packages\/workflow-primitives(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-contracts/workflow$1"' },
  { pattern: /from\s+["']@\/packages\/design-tokens(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-design-tokens$1"' },
  { pattern: /from\s+["']@\/packages\/auth(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-auth$1"' },
  { pattern: /from\s+["']@\/packages\/event-types(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-events$1"' },
  { pattern: /from\s+["']@\/packages\/client-sdk(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-sdk$1"' },
  { pattern: /from\s+["']@\/packages\/database-schemas(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-database-schemas$1"' },
  { pattern: /from\s+["']@\/packages\/feature-flags(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-feature-flags$1"' },
  { pattern: /from\s+["']@\/packages\/entitlements(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-entitlements$1"' },
  { pattern: /from\s+["']@\/packages\/telemetry(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-telemetry$1"' },
  { pattern: /from\s+["']@\/packages\/advisor-config(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-advisor-config$1"' },
  { pattern: /from\s+["']@\/packages\/feature-governance(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-feature-governance$1"' },
  { pattern: /from\s+["']@\/packages\/internal-agent-config(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-internal-agent-config$1"' },
  { pattern: /from\s+["']@\/packages\/store-metadata(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-store-metadata$1"' },
  { pattern: /from\s+["']@\/packages\/template-registry(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-template-registry$1"' },
  { pattern: /from\s+["']@\/packages\/microinteraction-engine(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-microinteraction-engine$1"' },
  { pattern: /from\s+["']@\/packages\/pack-manifests(\/[^"']*)?["']/g, replacement: 'from "@sita/shared-pack-manifests$1"' },

  // ── OS ──
  { pattern: /from\s+["']@\/lib\/nova-sdk(\/[^"']*)?["']/g, replacement: 'from "@sita/os$1"' },
  { pattern: /from\s+["']@\/lib\/os-services(\/[^"']*)?["']/g, replacement: 'from "@sita/os/services$1"' },
  { pattern: /from\s+["']@\/lib\/os-security(\/[^"']*)?["']/g, replacement: 'from "@sita/os/security$1"' },
  { pattern: /from\s+["']@\/lib\/sync-engine(\/[^"']*)?["']/g, replacement: 'from "@sita/os/sync$1"' },
  { pattern: /from\s+["']@\/components\/sita\/shell(\/[^"']*)?["']/g, replacement: 'from "@sita/os/shell$1"' },
  { pattern: /from\s+["']@\/components\/sita\/os(\/[^"']*)?["']/g, replacement: 'from "@sita/os/ui$1"' },

  // ── Backend ──
  { pattern: /from\s+["']@\/lib\/core-services(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/services$1"' },
  { pattern: /from\s+["']@\/lib\/platform-plane(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/gateway$1"' },
  { pattern: /from\s+["']@\/lib\/cloud-backbone(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/cloud$1"' },
  { pattern: /from\s+["']@\/lib\/persistence(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/persistence$1"' },
  { pattern: /from\s+["']@\/lib\/observability(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/observability$1"' },
  { pattern: /from\s+["']@\/lib\/ai(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/ai$1"' },
  { pattern: /from\s+["']@\/lib\/services\/ai-gateway(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/ai-gateway$1"' },
  { pattern: /from\s+["']@\/lib\/intelligence-architecture(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/intelligence$1"' },
  { pattern: /from\s+["']@\/lib\/advisor-intelligence(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/advisor$1"' },
  { pattern: /from\s+["']@\/lib\/advisor-protocol(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/advisor-protocol$1"' },
  { pattern: /from\s+["']@\/lib\/boardroom(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/boardroom$1"' },
  { pattern: /from\s+["']@\/lib\/strategic-intelligence(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/strategic$1"' },
  { pattern: /from\s+["']@\/lib\/domain-engines(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/domain-engines$1"' },
  { pattern: /from\s+["']@\/lib\/compute-governance(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/compute-governance$1"' },
  { pattern: /from\s+["']@\/lib\/no-hallucination(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/no-hallucination$1"' },
  { pattern: /from\s+["']@\/lib\/ai-engineering(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/ai-engineering$1"' },
  { pattern: /from\s+["']@\/lib\/detection(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/detection$1"' },
  { pattern: /from\s+["']@\/lib\/verification(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/verification$1"' },
  { pattern: /from\s+["']@\/lib\/shopify(\/[^"']*)?["']/g, replacement: 'from "@sita/backend/shopify$1"' },

  // ── Internal tools ──
  { pattern: /from\s+["']@\/lib\/simulation(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/simulations$1"' },
  { pattern: /from\s+["']@\/lib\/fip(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/fip$1"' },
  { pattern: /from\s+["']@\/lib\/dual-reality(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/dual-reality$1"' },
  { pattern: /from\s+["']@\/lib\/reality-audit(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/reality-audit$1"' },
  { pattern: /from\s+["']@\/lib\/reality-records(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/reality-records$1"' },
  { pattern: /from\s+["']@\/lib\/demo-data(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/demo-data$1"' },
  { pattern: /from\s+["']@\/lib\/seed(\/[^"']*)?["']/g, replacement: 'from "@sita/internal-tools/seed$1"' },

  // ── Admin UI ──
  { pattern: /from\s+["']@\/components\/admin(\/[^"']*)?["']/g, replacement: 'from "@sita/admin/components$1"' },
  { pattern: /from\s+["']@\/components\/admin-ai(\/[^"']*)?["']/g, replacement: 'from "@sita/admin/components/ai$1"' },
  { pattern: /from\s+["']@\/components\/admin-os(\/[^"']*)?["']/g, replacement: 'from "@sita/admin/components/os$1"' },
  { pattern: /from\s+["']@\/components\/governance(\/[^"']*)?["']/g, replacement: 'from "@sita/admin/components/governance$1"' },
  { pattern: /from\s+["']@\/lib\/admin-ai(\/[^"']*)?["']/g, replacement: 'from "@sita/admin/lib/ai$1"' },

  // ── Mobile UI ──
  { pattern: /from\s+["']@\/components\/mobile(\/[^"']*)?["']/g, replacement: 'from "@sita/mobile/components$1"' },

  // ── Planes barrel (keep as-is for in-Lovable usage) ──
  { pattern: /from\s+["']@\/planes\/(backend|os|shared|admin|founder|mobile)["']/g, replacement: 'from "@sita/$1"' },
];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.startsWith(".")) {
      files.push(...scanDir(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

interface RewriteResult { file: string; changes: number; details: string[] }
const results: RewriteResult[] = [];

const targetDirs = ["shared", "os", "backend", "apps", "internal-tools"];
const allFiles = targetDirs.flatMap(d => scanDir(d));

console.log(`\n🔄 SITA OS Import Rewriter ${DRY_RUN ? "(DRY RUN)" : ""}`);
console.log(`   Scanning ${allFiles.length} files across ${targetDirs.length} planes...\n`);

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changes = 0;
  const details: string[] = [];

  for (const rule of IMPORT_MAP) {
    const matches = content.match(rule.pattern);
    if (matches) {
      for (const match of matches) {
        details.push(`  ${match} → ${match.replace(rule.pattern, rule.replacement)}`);
        changes++;
      }
      content = content.replace(rule.pattern, rule.replacement);
    }
  }

  if (changes > 0) {
    if (!DRY_RUN) fs.writeFileSync(filePath, content, "utf-8");
    results.push({ file: filePath, changes, details });
  }
}

console.log(`📊 Results:`);
console.log(`   Files scanned: ${allFiles.length}`);
console.log(`   Files modified: ${results.length}`);
console.log(`   Total rewrites: ${results.reduce((s, r) => s + r.changes, 0)}\n`);

if (results.length > 0) {
  console.log("📝 Changes:");
  for (const r of results) {
    console.log(`\n   ${r.file} (${r.changes} changes)`);
    for (const d of r.details) console.log(`   ${d}`);
  }
}

// Write report
const report = {
  timestamp: new Date().toISOString(),
  dry_run: DRY_RUN,
  files_scanned: allFiles.length,
  files_modified: results.length,
  total_rewrites: results.reduce((s, r) => s + r.changes, 0),
  changes: results,
};
const reportPath = "generated/import-rewrite-report.json";
if (!DRY_RUN) {
  fs.mkdirSync("generated", { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${reportPath}`);
}
