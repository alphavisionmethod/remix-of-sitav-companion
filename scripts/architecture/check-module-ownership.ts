#!/usr/bin/env tsx
/**
 * SITA OS — Module Ownership Validator
 *
 * Enforces the 4-pillar architecture defined in src/modules/.
 * Rules:
 *   1. Pillars (business, concierge, finance, health) MUST NOT import
 *      from sibling pillars.
 *   2. _shared MUST NOT import from any pillar (leaf-only).
 *   3. _trust MUST NOT import from any pillar.
 *   4. Pillars MAY import from _shared and _trust.
 *
 * Run: npx tsx scripts/architecture/check-module-ownership.ts
 * CI:  add to architecture-report.ts to make it blocking.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const MODULES_DIR = join(ROOT, "src", "modules");

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

function main() {
  const files = walk(MODULES_DIR);
  for (const f of files) {
    const owner = ownerOf(f);
    if (!owner) continue;
    for (const spec of importsIn(f)) {
      const target = importTarget(spec);
      if (!target) continue;
      if (target === owner) continue;
      // Rule 1: pillar → sibling pillar = forbidden
      if (PILLARS.includes(owner as Pillar) && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "PILLAR_CROSSTALK", offending: spec });
      }
      // Rule 2 + 3: platform layers must not import pillars
      if ((PLATFORM as readonly string[]).includes(owner) && PILLARS.includes(target as Pillar)) {
        violations.push({ file: relative(ROOT, f), rule: "PLATFORM_IMPORTS_PILLAR", offending: spec });
      }
    }
  }

  if (violations.length === 0) {
    console.log("✅ Module ownership: OK (0 violations)");
    process.exit(0);
  }
  console.error(`❌ Module ownership: ${violations.length} violation(s)`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.file} → ${v.offending}`);
  process.exit(1);
}

main();