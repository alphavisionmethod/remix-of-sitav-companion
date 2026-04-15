#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Plane Boundary Enforcement
// Validates that code in each architectural plane only imports
// from allowed dependency planes. Run pre-migration and post.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation { file: string; rule: string; detail: string }
const violations: Violation[] = [];

// Current src/ mapping to logical planes
const PLANE_MEMBERSHIP: Record<string, string> = {
  "src/pages/admin/": "admin",
  "src/components/admin/": "admin",
  "src/components/admin-ai/": "admin",
  "src/components/admin-os/": "admin",
  "src/components/governance/": "admin",
  "src/lib/admin-ai/": "admin",
  "src/pages/owner/": "founder",
  "src/pages/owner-mode/": "founder",
  "src/pages/mission-control/": "founder",
  "src/pages/enterprise/": "founder",
  "src/pages/mobile/": "mobile",
  "src/components/mobile/": "mobile",
  "src/packages/contracts/": "shared",
  "src/packages/business-contracts/": "shared",
  "src/packages/finance-contracts/": "shared",
  "src/packages/concierge-contracts/": "shared",
  "src/packages/boardroom-contracts/": "shared",
  "src/packages/event-types/": "shared",
  "src/packages/design-tokens/": "shared",
  "src/packages/auth/": "shared",
  "src/packages/policy-contracts/": "shared",
  "src/packages/proof-model/": "shared",
  "src/lib/nova-sdk/": "os",
  "src/lib/os-services/": "os",
  "src/lib/os-security/": "os",
  "src/lib/sync-engine/": "os",
  "src/lib/core-services/": "backend",
  "src/lib/cloud-backbone/": "backend",
  "src/lib/platform-plane/": "backend",
  "src/lib/persistence/": "backend",
  "src/lib/ai-gateway/": "backend",
  "src/lib/sovereign-ai-gateway/": "backend",
  "src/lib/observability/": "backend",
  "src/lib/intelligence-architecture/": "backend",
  "src/lib/simulation/": "internal-tools",
  "src/lib/fip/": "internal-tools",
};

// Dependency rules: plane -> allowed import planes
const ALLOWED_DEPS: Record<string, string[]> = {
  "shared": [],
  "os": ["shared"],
  "backend": ["shared"],
  "product": ["shared", "os"],
  "admin": ["shared"],
  "founder": ["shared"],
  "mobile": ["shared"],
  "internal-tools": ["shared"],
};

// Forbidden cross-plane patterns
const CROSS_PLANE_RULES: Array<{ from: string; forbiddenImport: RegExp; detail: string }> = [
  // shared must not import backend/os/app code
  { from: "shared", forbiddenImport: /from\s+["']@\/lib\/core-services\//, detail: "shared imports backend core-services" },
  { from: "shared", forbiddenImport: /from\s+["']@\/lib\/nova-sdk\//, detail: "shared imports OS SDK" },
  { from: "shared", forbiddenImport: /from\s+["']@\/pages\//, detail: "shared imports page components" },
  { from: "shared", forbiddenImport: /from\s+["']@\/components\//, detail: "shared imports UI components" },

  // admin must not import founder/mobile/os internals
  { from: "admin", forbiddenImport: /from\s+["']@\/pages\/owner/, detail: "admin imports founder pages" },
  { from: "admin", forbiddenImport: /from\s+["']@\/pages\/mobile\//, detail: "admin imports mobile pages" },
  { from: "admin", forbiddenImport: /from\s+["']@\/lib\/nova-sdk\/kernel\//, detail: "admin imports OS kernel internals" },

  // founder must not import admin/mobile
  { from: "founder", forbiddenImport: /from\s+["']@\/pages\/admin\//, detail: "founder imports admin pages" },
  { from: "founder", forbiddenImport: /from\s+["']@\/pages\/mobile\//, detail: "founder imports mobile pages" },

  // mobile must not import admin/founder
  { from: "mobile", forbiddenImport: /from\s+["']@\/pages\/admin\//, detail: "mobile imports admin pages" },
  { from: "mobile", forbiddenImport: /from\s+["']@\/pages\/owner/, detail: "mobile imports founder pages" },

  // os must not import pages or admin components
  { from: "os", forbiddenImport: /from\s+["']@\/pages\//, detail: "OS imports page components" },
  { from: "os", forbiddenImport: /from\s+["']@\/components\/admin\//, detail: "OS imports admin components" },

  // backend must not import UI
  { from: "backend", forbiddenImport: /from\s+["']@\/pages\//, detail: "backend imports pages" },
  { from: "backend", forbiddenImport: /from\s+["']@\/components\//, detail: "backend imports UI components" },
  { from: "backend", forbiddenImport: /from\s+["']react/, detail: "backend imports React" },
];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.includes("node_modules")) files.push(...scanDir(full));
    else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

function getPlane(filePath: string): string | null {
  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  // Check most specific paths first (sorted by length descending)
  const sorted = Object.entries(PLANE_MEMBERSHIP).sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, plane] of sorted) {
    if (rel.startsWith(prefix)) return plane;
  }
  return null; // unmapped = product plane (default)
}

// Scan all source files
const allFiles = scanDir("src");

for (const f of allFiles) {
  const plane = getPlane(f);
  if (!plane) continue;

  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);

  for (const rule of CROSS_PLANE_RULES) {
    if (rule.from === plane && rule.forbiddenImport.test(content)) {
      violations.push({
        file: rel,
        rule: "PLANE_BOUNDARY",
        detail: rule.detail,
      });
    }
  }
}

// Also check edge functions don't import frontend
const efFiles = scanDir("supabase/functions");
for (const f of efFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  if (/from\s+["']@\/pages/.test(content) || /from\s+["']@\/components/.test(content)) {
    violations.push({ file: rel, rule: "EDGE_FN_UI_IMPORT", detail: "Edge function imports frontend code" });
  }
  if (/from\s+["']react/.test(content)) {
    violations.push({ file: rel, rule: "EDGE_FN_REACT", detail: "Edge function imports React" });
  }
}

// Plane distribution
const planeCounts: Record<string, number> = {};
for (const f of allFiles) {
  const p = getPlane(f) || "product";
  planeCounts[p] = (planeCounts[p] || 0) + 1;
}

// Report
console.log(`\n═══ SITA OS Plane Boundary Check ═══\n`);
console.log(`Scanned ${allFiles.length + efFiles.length} files\n`);
console.log("Plane Distribution:");
for (const [plane, count] of Object.entries(planeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${plane.padEnd(15)} ${count} files`);
}
console.log("");

// Write JSON report
const reportDir = "generated";
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(`${reportDir}/boundary-check-report.json`, JSON.stringify({
  timestamp: new Date().toISOString(),
  total_files: allFiles.length + efFiles.length,
  plane_distribution: planeCounts,
  violations_count: violations.length,
  violations,
  passed: violations.length === 0,
}, null, 2));
console.log("📄 Report: generated/boundary-check-report.json\n");

if (violations.length === 0) {
  console.log("✅ All plane boundaries respected — no violations found");
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} plane boundary violation(s):\n`);
  const grouped: Record<string, Violation[]> = {};
  for (const v of violations) {
    const key = v.detail;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(v);
  }
  for (const [detail, vs] of Object.entries(grouped)) {
    console.error(`  [${vs[0].rule}] ${detail} (${vs.length} file(s))`);
    for (const v of vs.slice(0, 3)) console.error(`    → ${v.file}`);
    if (vs.length > 3) console.error(`    → ... and ${vs.length - 3} more`);
    console.error("");
  }
  process.exit(1);
}
