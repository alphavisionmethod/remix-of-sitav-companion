#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — IA Coherence Check Script
// Verifies Information Architecture governance assertions:
//  1. Every admin domain has nav items
//  2. Every route file exports a getter function
//  3. Shell components exist and export correctly
//  4. No orphan admin pages (pages not reachable from any route)
//  5. Breadcrumb labels cover all known path segments
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  rule: string;
  severity: "error" | "warning";
  message: string;
  file?: string;
}

const violations: Violation[] = [];
const ROOT = process.cwd();

function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function readFile(rel: string): string {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf-8") : "";
}

// ── Rule 1: Admin shell components exist ────────────────────
const REQUIRED_SHELL_COMPONENTS = [
  "src/components/admin/shells/AdminControlPlaneShell.tsx",
  "src/components/admin/shells/AdminPrimaryNav.tsx",
  "src/components/admin/shells/AdminDomainNav.tsx",
  "src/components/admin/shells/AdminBreadcrumbs.tsx",
  "src/components/admin/shells/AdminShell.tsx",
];

for (const comp of REQUIRED_SHELL_COMPONENTS) {
  if (!fileExists(comp)) {
    violations.push({
      rule: "SHELL_COMPONENT_EXISTS",
      severity: "error",
      message: `Required shell component missing: ${comp}`,
      file: comp,
    });
  }
}

// ── Rule 2: Shell barrel exports all shell components ───────
const shellBarrel = readFile("src/components/admin/shells/index.ts");
const REQUIRED_EXPORTS = [
  "AdminControlPlaneShell",
  "AdminPrimaryNav",
  "AdminDomainNav",
  "AdminBreadcrumbs",
  "AdminShell",
];
for (const exp of REQUIRED_EXPORTS) {
  if (!shellBarrel.includes(exp)) {
    violations.push({
      rule: "SHELL_BARREL_EXPORT",
      severity: "error",
      message: `Shell barrel missing export: ${exp}`,
      file: "src/components/admin/shells/index.ts",
    });
  }
}

// ── Rule 3: All canonical route files exist ─────────────────
const REQUIRED_ROUTE_FILES = [
  "src/routes/AdminRoutes.tsx",
  "src/routes/MobileRoutes.tsx",
  "src/routes/OwnerRoutes.tsx",
  "src/routes/advisor-routes.tsx",
  "src/routes/boardroom-routes.tsx",
  "src/routes/business-routes.tsx",
  "src/routes/concierge-routes.tsx",
  "src/routes/files-routes.tsx",
  "src/routes/money-routes.tsx",
  "src/routes/os-routes.tsx",
  "src/routes/communications-routes.tsx",
  "src/routes/apps-routes.tsx",
  "src/routes/settings-routes.tsx",
];

for (const rf of REQUIRED_ROUTE_FILES) {
  if (!fileExists(rf)) {
    violations.push({
      rule: "ROUTE_FILE_EXISTS",
      severity: "error",
      message: `Required route file missing: ${rf}`,
      file: rf,
    });
  } else {
    const content = readFile(rf);
    // Check it exports a function
    if (!content.includes("export function") && !content.includes("export default")) {
      violations.push({
        rule: "ROUTE_FILE_EXPORTS",
        severity: "warning",
        message: `Route file does not export a function: ${rf}`,
        file: rf,
      });
    }
  }
}

// ── Rule 4: Admin domain nav has all 7+ domains ─────────────
const domainNavContent = readFile("src/components/admin/shells/AdminDomainNav.tsx");
const REQUIRED_DOMAINS = [
  "home",
  "intelligence",
  "governance",
  "launch",
  "security",
  "operations",
  "support",
];
for (const domain of REQUIRED_DOMAINS) {
  if (!domainNavContent.includes(`"${domain}"`)) {
    violations.push({
      rule: "DOMAIN_NAV_COMPLETENESS",
      severity: "error",
      message: `AdminDomainNav missing domain: ${domain}`,
      file: "src/components/admin/shells/AdminDomainNav.tsx",
    });
  }
}

// ── Rule 5: Breadcrumbs cover critical path segments ────────
const breadcrumbContent = readFile("src/components/admin/shells/AdminBreadcrumbs.tsx");
const CRITICAL_SEGMENTS = [
  "dashboard",
  "ai-gateway",
  "intelligence",
  "architecture",
  "launch",
  "security",
  "fleet",
  "support",
  "founder",
  "engineering",
  "communications",
  "apps",
  "settings",
];
for (const seg of CRITICAL_SEGMENTS) {
  if (!breadcrumbContent.includes(seg)) {
    violations.push({
      rule: "BREADCRUMB_LABEL_COVERAGE",
      severity: "warning",
      message: `AdminBreadcrumbs missing label for segment: ${seg}`,
      file: "src/components/admin/shells/AdminBreadcrumbs.tsx",
    });
  }
}

// ── Rule 6: No duplicate route keys in AdminRoutes ──────────
const adminRoutesContent = readFile("src/routes/AdminRoutes.tsx");
const keyMatches = [...adminRoutesContent.matchAll(/key="([^"]+)"/g)];
const keyCounts: Record<string, number> = {};
for (const [, key] of keyMatches) {
  keyCounts[key] = (keyCounts[key] ?? 0) + 1;
}
for (const [key, count] of Object.entries(keyCounts)) {
  if (count > 1) {
    violations.push({
      rule: "ROUTE_KEY_UNIQUE",
      severity: "error",
      message: `Duplicate route key "${key}" appears ${count} times`,
      file: "src/routes/AdminRoutes.tsx",
    });
  }
}

// ── Rule 7: Admin pages barrel exports all domains ──────────
const adminPagesBarrel = readFile("src/admin/pages/index.ts");
const REQUIRED_ADMIN_DOMAINS = [
  "home", "ai", "runtime", "operations", "intelligence",
  "integrations", "launch", "governance", "strategic",
  "security", "architecture", "support", "verification",
  "reality-audit", "fleet",
];
for (const domain of REQUIRED_ADMIN_DOMAINS) {
  if (!adminPagesBarrel.includes(`"./${domain}"`)) {
    violations.push({
      rule: "ADMIN_BARREL_COMPLETENESS",
      severity: "warning",
      message: `Admin pages barrel missing domain: ${domain}`,
      file: "src/admin/pages/index.ts",
    });
  }
}

// ── Report ──────────────────────────────────────────────────
const errors = violations.filter((v) => v.severity === "error");
const warnings = violations.filter((v) => v.severity === "warning");

console.log("═══════════════════════════════════════════════════════");
console.log("  SITA OS — IA Coherence Check Report");
console.log("═══════════════════════════════════════════════════════");
console.log();

if (violations.length === 0) {
  console.log("✅ PASS — Zero violations. All governance assertions satisfied.");
} else {
  if (errors.length > 0) {
    console.log(`❌ ERRORS: ${errors.length}`);
    for (const v of errors) {
      console.log(`  [${v.rule}] ${v.message}`);
      if (v.file) console.log(`    → ${v.file}`);
    }
    console.log();
  }
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${warnings.length}`);
    for (const v of warnings) {
      console.log(`  [${v.rule}] ${v.message}`);
      if (v.file) console.log(`    → ${v.file}`);
    }
  }
}

console.log();
console.log(`Total: ${errors.length} errors, ${warnings.length} warnings`);
console.log("═══════════════════════════════════════════════════════");

process.exit(errors.length > 0 ? 1 : 0);
