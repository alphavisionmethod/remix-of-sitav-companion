#!/usr/bin/env tsx
/**
 * SITA OS — Module Ownership Validator
 *
 * Enforces the Repository Constitution
 * (docs/architecture/REPOSITORY_CONSTITUTION.md).
 *
 * Rules enforced here:
 *   1. Pillars (business, concierge, finance, health) MUST NOT import from
 *      sibling pillars.                              [PILLAR_CROSSTALK]
 *   2. _shared / _trust MUST NOT import from any pillar (leaf-only).
 *                                                    [PLATFORM_IMPORTS_PILLAR]
 *   3. src/platform/** MUST NOT import from src/modules/<pillar>/**.
 *                                                    [PLATFORM_IMPORTS_PILLAR]
 *   4. src/components/** MUST NOT import from src/pages/** or
 *      src/modules/<pillar>/**.                      [SHARED_COMPONENTS_LEAK]
 *   5. src/domains/** MUST NOT import from src/lib/services/**,
 *      src/integrations/**, or React UI.             [DOMAIN_PURITY]
 *
 * Run: npx tsx scripts/architecture/check-module-ownership.ts
 * Modes:
 *   default   — ALL violations counted; non-zero exit if any present.
 *   --warn    — print but always exit 0 (used during in-flight migration waves).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MODULES_DIR = join(ROOT, "src", "modules");
const PLATFORM_DIR = join(ROOT, "src", "platform");
const COMPONENTS_DIR = join(ROOT, "src", "components");
const DOMAINS_DIR = join(ROOT, "src", "domains");
const WARN_ONLY = process.argv.includes("--warn");

type Pillar = "business" | "concierge" | "finance" | "health";
const PILLARS: Pillar[] = ["business", "concierge", "finance", "health"];
const PLATFORM = ["_shared", "_trust"] as const;

type Violation = { file: string; rule: string; offending: string };
const violations: Violation[] = [];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

function importsIn(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const re = /from\s+["']([^"']+)["']/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

function ownerOf(file: string): Pillar | "_shared" | "_trust" | null {
  const r = relative(MODULES_DIR, file).split(/[\\/]/);
  const top = r[0];
  if (PILLARS.includes(top as Pillar)) return top as Pillar;
  if ((PLATFORM as readonly string[]).includes(top)) return top as "_shared" | "_trust";
  return null;
}

function importTarget(spec: string): Pillar | "_shared" | "_trust" | null {
  // Match @/modules/<x>/... or relative paths into modules/<x>
  const m = spec.match(/(?:^|\/)modules\/([^/]+)/);
  if (!m) return null;
  const target = m[1];
  if (PILLARS.includes(target as Pillar)) return target as Pillar;
  if ((PLATFORM as readonly string[]).includes(target)) return target as "_shared" | "_trust";
  return null;
}

function checkPillarBoundaries() {
  const files = walk(MODULES_DIR);
  for (const f of files) {
    const owner = ownerOf(f);
    if (!owner) continue;
    for (const spec of importsIn(f)) {
      const target = importTarget(spec);
      if (!target) continue;
      if (target === owner) continue;
      if (PILLARS.includes(owner as Pillar) && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "PILLAR_CROSSTALK", offending: spec });
      }
      if ((PLATFORM as readonly string[]).includes(owner) && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "PLATFORM_IMPORTS_PILLAR", offending: spec });
      }
    }
  }
}

function checkPlatformDoesNotImportPillars() {
  // Rule 3: src/platform/** MUST NOT import a pillar.
  const files = walk(PLATFORM_DIR);
  for (const f of files) {
    for (const spec of importsIn(f)) {
      const target = importTarget(spec);
      if (target && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "PLATFORM_IMPORTS_PILLAR", offending: spec });
      }
    }
  }
}

function checkSharedComponentsLeak() {
  // Rule 4: src/components/** MUST NOT import from src/pages/** or src/modules/<pillar>/**.
  const files = walk(COMPONENTS_DIR);
  for (const f of files) {
    for (const spec of importsIn(f)) {
      if (/^@\/pages(\/|$)/.test(spec)) {
        violations.push({ file: relative(ROOT, f), rule: "SHARED_COMPONENTS_LEAK", offending: spec });
        continue;
      }
      const target = importTarget(spec);
      if (target && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "SHARED_COMPONENTS_LEAK", offending: spec });
      }
    }
  }
}

function checkDomainPurity() {
  // Rule 5: src/domains/** is side-effect free.
  const files = walk(DOMAINS_DIR);
  const FORBIDDEN = [
    /^@\/lib\/services(\/|$)/,
    /^@\/integrations(\/|$)/,
    /^react($|\/)/,
    /^react-dom($|\/)/,
  ];
  for (const f of files) {
    for (const spec of importsIn(f)) {
      if (FORBIDDEN.some((re) => re.test(spec))) {
        violations.push({ file: relative(ROOT, f), rule: "DOMAIN_PURITY", offending: spec });
      }
    }
  }
}

function main() {
  checkPillarBoundaries();
  checkPlatformDoesNotImportPillars();
  checkSharedComponentsLeak();
  checkDomainPurity();

  if (violations.length === 0) {
    console.log("✅ Module ownership: OK (0 violations)");
    process.exit(0);
  }
  const fn = WARN_ONLY ? console.warn : console.error;
  fn(`${WARN_ONLY ? "⚠️" : "❌"} Module ownership: ${violations.length} violation(s)${WARN_ONLY ? " (WARN mode)" : ""}`);
  // Group by rule for readability.
  const grouped: Record<string, Violation[]> = {};
  for (const v of violations) (grouped[v.rule] ??= []).push(v);
  for (const [rule, list] of Object.entries(grouped)) {
    fn(`  ── ${rule}: ${list.length}`);
    for (const v of list.slice(0, 25)) fn(`     ${v.file} → ${v.offending}`);
    if (list.length > 25) fn(`     … and ${list.length - 25} more`);
  }
  process.exit(WARN_ONLY ? 0 : 1);
}

main();