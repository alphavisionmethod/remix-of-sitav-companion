#!/usr/bin/env tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Components Allowlist Validator (Repository Constitution Rule 13)
 * ════════════════════════════════════════════════════════════════════════
 *
 * After Wave 7, `src/components/` is reserved for shared UI only. Every
 * legacy pillar/platform subtree under it MUST contain ONLY thin
 * Wave-7 adapters of the form:
 *
 *   export * from "@/{modules|platform}/<owner>/components/<sub>/...";
 *   export { default } from "@/{modules|platform}/<owner>/components/<sub>/...";
 *
 * This validator enforces:
 *   1. Only allowlisted subtrees may contain non-adapter source.
 *   2. Every file in a frozen subtree must be a thin adapter (≤ MAX_LINES
 *      logical lines and contain only `export ... from "..."` statements).
 *   3. Adapters must point at canonical `@/modules/*` or `@/platform/*` paths.
 *
 * Modes:
 *   --warn   : non-zero exit only on PARSE errors (default during a wave)
 *   --strict : non-zero exit on any violation (production CI mode)
 *
 * Run: npx tsx scripts/architecture/check-components-allowlist.ts [--strict]
 * ════════════════════════════════════════════════════════════════════════
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const COMPONENTS_DIR = join(ROOT, "src", "components");
const STRICT = process.argv.includes("--strict");

/** Subtrees that may contain authored, non-adapter source. */
const SHARED_ALLOWLIST = new Set<string>([
  "ui",
  "primitives",
  "shared",
  "cards",
  "navigation",
  "launcher",
  "__tests__",
]);

/** Loose root files (not inside any subdir) that are allowed to remain authored. */
const ROOT_FILE_ALLOWLIST = new Set<string>([
  "NavLink.tsx",
]);

const MAX_LINES = 12; // adapters are 6–8 lines including the Wave-7 banner.

type ViolationKind =
  | "FROZEN_NON_ADAPTER"        // file in frozen subtree contains real code
  | "ADAPTER_NON_CANONICAL"     // adapter points outside @/modules/* or @/platform/*
  | "UNKNOWN_ROOT_FILE"         // top-level src/components/<file>.tsx not allowlisted
  | "PARSE_ERROR";

interface Violation {
  file: string;
  kind: ViolationKind;
  detail: string;
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    let s; try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

function logicalLines(src: string): string[] {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));
}

const RE_EXPORT = /^export\s+(?:\*|\{[^}]*\}|default)\s+from\s+["']([^"']+)["'];?$/;

function classify(src: string): { adapter: boolean; targets: string[]; lines: string[] } {
  const lines = logicalLines(src);
  const targets: string[] = [];
  const adapter = lines.length > 0 && lines.every((l) => {
    const m = l.match(RE_EXPORT);
    if (!m) return false;
    targets.push(m[1]);
    return true;
  });
  return { adapter, targets, lines };
}

function isCanonicalTarget(target: string): boolean {
  return target.startsWith("@/modules/") || target.startsWith("@/platform/");
}

const violations: Violation[] = [];

// ── 1. Top-level loose files ───────────────────────────────────────────
for (const entry of readdirSync(COMPONENTS_DIR)) {
  const p = join(COMPONENTS_DIR, entry);
  let s; try { s = statSync(p); } catch { continue; }
  if (s.isFile() && /\.(ts|tsx)$/.test(entry) && !ROOT_FILE_ALLOWLIST.has(entry)) {
    violations.push({
      file: relative(ROOT, p),
      kind: "UNKNOWN_ROOT_FILE",
      detail: `Top-level src/components/${entry} is not allowlisted. Move under a canonical owner or add to ROOT_FILE_ALLOWLIST in this validator.`,
    });
  }
}

// ── 2. Subtree enforcement ─────────────────────────────────────────────
for (const sub of readdirSync(COMPONENTS_DIR)) {
  const subPath = join(COMPONENTS_DIR, sub);
  let s; try { s = statSync(subPath); } catch { continue; }
  if (!s.isDirectory()) continue;
  if (SHARED_ALLOWLIST.has(sub)) continue;

  // Frozen subtree — every file must be a thin canonical adapter.
  const files = walk(subPath);
  for (const file of files) {
    let src: string;
    try { src = readFileSync(file, "utf-8"); }
    catch (e) {
      violations.push({ file: relative(ROOT, file), kind: "PARSE_ERROR", detail: String(e) });
      continue;
    }
    const { adapter, targets, lines } = classify(src);
    if (!adapter) {
      violations.push({
        file: relative(ROOT, file),
        kind: "FROZEN_NON_ADAPTER",
        detail: `Frozen subtree '${sub}' may only contain Wave-7 thin adapters. Found ${lines.length} logical line(s) of authored code.`,
      });
      continue;
    }
    if (lines.length > MAX_LINES) {
      violations.push({
        file: relative(ROOT, file),
        kind: "FROZEN_NON_ADAPTER",
        detail: `Adapter exceeds ${MAX_LINES} logical lines (${lines.length}). Trim to canonical re-export only.`,
      });
    }
    for (const t of targets) {
      if (!isCanonicalTarget(t)) {
        violations.push({
          file: relative(ROOT, file),
          kind: "ADAPTER_NON_CANONICAL",
          detail: `Adapter targets non-canonical path: ${t}. Expected @/modules/* or @/platform/*.`,
        });
      }
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────────
const auditDir = join(ROOT, "generated", "audits");
mkdirSync(auditDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  mode: STRICT ? "strict" : "warn",
  totalViolations: violations.length,
  byKind: violations.reduce<Record<string, number>>((acc, v) => {
    acc[v.kind] = (acc[v.kind] ?? 0) + 1; return acc;
  }, {}),
  violations: violations.slice(0, 200),
};
writeFileSync(
  join(auditDir, "wave-8-components-allowlist-report.json"),
  JSON.stringify(report, null, 2),
  "utf-8",
);

console.log("════════════════════════════════════════════════════════════");
console.log(`Wave 8 — Components Allowlist Check (${STRICT ? "STRICT" : "WARN"})`);
console.log("════════════════════════════════════════════════════════════");
console.log(`Violations: ${violations.length}`);
if (violations.length) {
  console.log("By kind:", report.byKind);
  for (const v of violations.slice(0, 25)) {
    console.log(`  • [${v.kind}] ${v.file}`);
    console.log(`        ${v.detail}`);
  }
  if (violations.length > 25) console.log(`  … and ${violations.length - 25} more (see report)`);
}

const hasParseError = violations.some((v) => v.kind === "PARSE_ERROR");
if (STRICT && violations.length > 0) process.exit(1);
if (!STRICT && hasParseError) process.exit(1);
process.exit(0);
