#!/usr/bin/env tsx
/**
 * check-ui-ownership.ts — Wave C BLOCKING validator
 *
 * Enforces the 5-zone UI Ownership Law (Constitution §C.1):
 *
 *  Rule 1 — Sealed allowlist for src/components/*
 *           Only `NavLink.tsx`, `primitives/`, `ui/`, `__tests__/` may exist.
 *
 *  Rule 2 — Deprecated shim folders may not be re-introduced
 *           (`cards/`, `launcher/`, `navigation/`, `shared/`,
 *            `primitives/actions/`).
 *
 *  Rule 3 — Primitive purity
 *           Files under `src/components/primitives/**` may not import from
 *           @/modules, @/platform, @/admin, @/app, @/runtimes.
 *
 *  Rule 4 — No module/platform/admin/shell-semantic names at the root
 *           Forbids well-known owner-named folders directly under
 *           src/components/ (e.g. `business/`, `advisors/`, `admin/`,
 *           `concierge/`, `finance/`, `mobile/`, etc.).
 *
 * Output: generated/ui-ownership-report.json
 * Exit:   0 = pass, 1 = block.
 */

import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const REPO_ROOT = process.cwd();
const COMPONENTS_ROOT = join(REPO_ROOT, "src/components");
const PRIMITIVES_ROOT = join(REPO_ROOT, "src/components/primitives");
const REPORT_PATH = join(REPO_ROOT, "generated/ui-ownership-report.json");

const ALLOWED_TOP_LEVEL = new Set([
  "NavLink.tsx",
  "primitives",
  "ui",
  "__tests__",
]);

const FORBIDDEN_DEPRECATED = new Set([
  "cards",
  "launcher",
  "navigation",
  "shared",
]);

const FORBIDDEN_OWNER_NAMES = new Set([
  "admin", "admin-ai", "admin-os",
  "advisors", "business", "business-advisors",
  "concierge", "finance", "money", "investment", "revenue-office",
  "personal-brain", "intelligence", "files", "governance", "notifications",
  "runtime", "observability", "simulation", "marketing",
  "sita", "mobile", "platform", "trust", "cloud",
]);

const PRIMITIVE_FORBIDDEN_PREFIXES = [
  "@/modules/",
  "@/platform/",
  "@/admin/",
  "@/app/",
  "@/runtimes/",
];

interface Violation {
  rule: 1 | 2 | 3 | 4;
  ruleName: string;
  path: string;
  detail: string;
}

const violations: Violation[] = [];

function listDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir);
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(p);
  }
  return out;
}

// ── Rules 1, 2, 4 — top-level allowlist ─────────────────────────────────────
for (const entry of listDir(COMPONENTS_ROOT)) {
  if (ALLOWED_TOP_LEVEL.has(entry)) continue;

  const rel = relative(REPO_ROOT, join(COMPONENTS_ROOT, entry));

  if (FORBIDDEN_DEPRECATED.has(entry)) {
    violations.push({
      rule: 2,
      ruleName: "deprecated-shim-reintroduced",
      path: rel,
      detail: `Folder \`${entry}/\` was removed in Wave C and must not be re-introduced. Use the canonical owner zone (see docs/architecture/UI_OWNERSHIP_MODEL.md).`,
    });
    continue;
  }

  if (FORBIDDEN_OWNER_NAMES.has(entry.replace(/\.tsx?$/, ""))) {
    violations.push({
      rule: 4,
      ruleName: "owner-semantic-name-at-root",
      path: rel,
      detail: `\`${entry}\` looks owner-semantic (module/platform/admin/shell). Move to its canonical owner zone instead of placing it under src/components/.`,
    });
    continue;
  }

  violations.push({
    rule: 1,
    ruleName: "components-root-allowlist",
    path: rel,
    detail: `\`${entry}\` is not on the src/components/* allowlist. Only NavLink.tsx, primitives/, ui/, __tests__/ are permitted at this level.`,
  });
}

// ── Rule 2 (subfolder) — primitives/actions must stay removed ───────────────
if (existsSync(join(PRIMITIVES_ROOT, "actions"))) {
  violations.push({
    rule: 2,
    ruleName: "deprecated-shim-reintroduced",
    path: "src/components/primitives/actions",
    detail: "Folder `primitives/actions/` was removed in Wave C (was a shim layer over src/admin/components/operator/** and src/platform/trust/components/**).",
  });
}

// ── Rule 3 — primitive purity ───────────────────────────────────────────────
const primitiveFiles = walk(PRIMITIVES_ROOT);
const importRe = /from\s+["']([^"']+)["']/g;
for (const file of primitiveFiles) {
  const src = readFileSync(file, "utf8");
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    const spec = m[1];
    for (const prefix of PRIMITIVE_FORBIDDEN_PREFIXES) {
      if (spec.startsWith(prefix)) {
        violations.push({
          rule: 3,
          ruleName: "primitive-purity",
          path: relative(REPO_ROOT, file),
          detail: `Forbidden import \`${spec}\`. Primitives must be owner-neutral; allowed deps are @/components/ui/**, @/lib/utils, and other primitives.`,
        });
        break;
      }
    }
  }
}

// ── Emit report ─────────────────────────────────────────────────────────────
const report = {
  validator: "check-ui-ownership",
  generatedAt: new Date().toISOString(),
  passed: violations.length === 0,
  totalViolations: violations.length,
  byRule: {
    rule1_componentsRootAllowlist: violations.filter((v) => v.rule === 1).length,
    rule2_deprecatedShimReintroduced: violations.filter((v) => v.rule === 2).length,
    rule3_primitivePurity: violations.filter((v) => v.rule === 3).length,
    rule4_ownerSemanticNameAtRoot: violations.filter((v) => v.rule === 4).length,
  },
  violations,
};

mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

if (violations.length === 0) {
  console.log(`✅ check-ui-ownership: PASS — src/components/ tree conforms to UI Ownership Law (${primitiveFiles.length} primitives scanned).`);
  process.exit(0);
}

console.error(`❌ check-ui-ownership: BLOCK — ${violations.length} violation(s) in src/components/ tree.`);
for (const v of violations) {
  console.error(`  [Rule ${v.rule}] ${v.ruleName}: ${v.path}`);
  console.error(`            ${v.detail}`);
}
console.error(`\nReport: ${relative(REPO_ROOT, REPORT_PATH)}`);
console.error(`Authority: docs/architecture/UI_OWNERSHIP_MODEL.md (Constitution §C.1)`);
process.exit(1);