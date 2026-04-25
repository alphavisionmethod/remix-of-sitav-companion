#!/usr/bin/env tsx
/**
 * SITA OS — Admin Plane Boundary Validator (Wave 0.6, BLOCKING)
 *
 * Authority: Constitution Rule 31.
 *
 * Checks:
 *   1. platform→admin import count must not exceed baseline.
 *   2. modules→admin import count must not exceed baseline.
 *   3. admin→modules import count must not exceed baseline.
 *   4. Any NEW src/pages/admin/*.tsx file with >10 logical lines that does
 *      NOT re-export from @/admin/** is a Rule 30 violation (BLOCKING).
 *      "New" = file path not in admin-page-body-baseline allow-set.
 *
 * Modes:
 *   default (--strict)  : non-zero exit on any violation.
 *   --warn              : print but exit 0.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PAGES_ADMIN = join(ROOT, "src", "pages", "admin");
const PLATFORM = join(ROOT, "src", "platform");
const MODULES = join(ROOT, "src", "modules");
const ADMIN = join(ROOT, "src", "admin");
const MAP_PATH = join(ROOT, "generated", "manifests", "admin-plane-ownership-map.json");
const DEP_BASELINE_PATH = join(ROOT, "generated", "manifests", "admin-dependency-violation-baseline.json");
const PAGE_BASELINE_PATH = join(ROOT, "generated", "manifests", "admin-page-body-baseline.json");
const WARN_ONLY = process.argv.includes("--warn");

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

function logicalLineCount(src: string): number {
  let inBlock = false;
  let n = 0;
  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (inBlock) {
      if (line.includes("*/")) inBlock = false;
      continue;
    }
    if (line.startsWith("/*")) {
      if (!line.includes("*/")) inBlock = true;
      continue;
    }
    if (line.startsWith("//")) continue;
    n++;
  }
  return n;
}

if (!existsSync(MAP_PATH) || !existsSync(DEP_BASELINE_PATH) || !existsSync(PAGE_BASELINE_PATH)) {
  console.error(
    "❌ Admin plane manifests missing. Run: npx tsx scripts/manifests/generate/generate-admin-plane-ownership-map.ts",
  );
  process.exit(WARN_ONLY ? 0 : 1);
}

const map = JSON.parse(readFileSync(MAP_PATH, "utf8")) as {
  entries: Array<{ file: string; kind: "THIN_ADAPTER" | "LEGACY_PAGE_BODY"; logicalLines: number }>;
  dependencyInventory: {
    platformImportingAdmin: string[];
    moduleImportingAdmin: string[];
    adminImportingModules: string[];
  };
};
const depBaseline = JSON.parse(readFileSync(DEP_BASELINE_PATH, "utf8")) as {
  baselines: {
    platformImportingAdminCount: number;
    moduleImportingAdminCount: number;
    adminImportingModulesCount: number;
  };
};
const pageBaseline = JSON.parse(readFileSync(PAGE_BASELINE_PATH, "utf8")) as {
  legacyPageBodyCount: number;
};

type Violation = { rule: string; severity: "block"; detail: string };
const violations: Violation[] = [];

// ── Check 1–3: Dependency ratchets ──────────────────────────────────────────
const cur = map.dependencyInventory;
if (cur.platformImportingAdmin.length > depBaseline.baselines.platformImportingAdminCount) {
  violations.push({
    rule: "ADMIN_PLATFORM_IMPORT_RATCHET",
    severity: "block",
    detail: `platform→admin imports grew from ${depBaseline.baselines.platformImportingAdminCount} → ${cur.platformImportingAdmin.length}. New offenders: ${cur.platformImportingAdmin.slice(depBaseline.baselines.platformImportingAdminCount).join(", ")}`,
  });
}
if (cur.moduleImportingAdmin.length > depBaseline.baselines.moduleImportingAdminCount) {
  violations.push({
    rule: "ADMIN_MODULE_IMPORT_RATCHET",
    severity: "block",
    detail: `modules→admin imports grew from ${depBaseline.baselines.moduleImportingAdminCount} → ${cur.moduleImportingAdmin.length}.`,
  });
}
if (cur.adminImportingModules.length > depBaseline.baselines.adminImportingModulesCount) {
  violations.push({
    rule: "ADMIN_TO_MODULE_RATCHET",
    severity: "block",
    detail: `admin→modules imports grew from ${depBaseline.baselines.adminImportingModulesCount} → ${cur.adminImportingModules.length}.`,
  });
}

// ── Check 4: New page bodies in src/pages/admin must be thin adapters ──────
// We rely on the page-body baseline: existing LEGACY_PAGE_BODY count is
// allowed; total LEGACY count must not grow.
const currentLegacy = map.entries.filter((e) => e.kind === "LEGACY_PAGE_BODY").length;
if (currentLegacy > pageBaseline.legacyPageBodyCount) {
  violations.push({
    rule: "ADMIN_NEW_PAGE_BODY_FORBIDDEN",
    severity: "block",
    detail: `LEGACY_PAGE_BODY count grew from ${pageBaseline.legacyPageBodyCount} → ${currentLegacy}. New src/pages/admin/* files MUST be thin re-exports from @/admin/** (Rule 30).`,
  });
}

// ── Report ──────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log(
    `✅ Admin plane boundaries OK — platform→admin=${cur.platformImportingAdmin.length} (baseline ${depBaseline.baselines.platformImportingAdminCount}), ` +
      `modules→admin=${cur.moduleImportingAdmin.length} (baseline ${depBaseline.baselines.moduleImportingAdminCount}), ` +
      `admin→modules=${cur.adminImportingModules.length} (baseline ${depBaseline.baselines.adminImportingModulesCount}), ` +
      `legacy bodies=${currentLegacy} (baseline ${pageBaseline.legacyPageBodyCount}).`,
  );
} else {
  console.error(`❌ Admin plane boundary violations: ${violations.length}`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.detail}`);
}

process.exit(WARN_ONLY ? 0 : violations.length === 0 ? 0 : 1);
