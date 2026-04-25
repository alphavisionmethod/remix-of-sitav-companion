#!/usr/bin/env tsx
/**
 * SITA OS — Pages Thin-Adapter Validator (Repository Constitution Rule 7)
 *
 * Asserts that pillar-owned page files under src/pages/<pillar>/ are
 * either pure re-exports (`export { default } from "@/modules/..."`) or
 * ≤40 logical lines. The canonical body must live in
 * src/modules/<pillar>/pages/ or src/platform/<system>/pages/.
 *
 * Modes:
 *   --warn   (default during a migration wave): non-zero exit only on PARSE errors
 *   --strict : non-zero exit on any violation
 *
 * Run: npx tsx scripts/architecture/check-pages-thin-adapter.ts [--strict]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, "src", "pages");
const STRICT = process.argv.includes("--strict");

/**
 * Subdirectories under src/pages/ in scope for the syntactic ≤40-line
 * thin-adapter check. Wave 0.7 expanded coverage to every non-test subtree;
 * the semantic contract is enforced separately by
 * scripts/architecture/check-page-semantic-adapter.ts (Rules 33–35).
 */
const PILLAR_PAGE_DIRS = [
  "business",
  "concierge",
  "finance",
  "health",
  "money",
  "investment-office",
  "revenue-office",
  "digital-presence",
  "admin",
  "mobile",
  "owner-mode",
  "owner",
  "apps",
  "atlas",
  "advisors",
  "boardroom",
  "business-advisors",
  "enterprise",
  "files",
  "intelligence",
  "integrations",
  "marketing",
  "mission",
  "mission-control",
  "personal-brain",
  "settings",
  "sita",
  "store",
  "trust",
  "tenant",
  "auth",
  "workspace",
  "app-platform",
] as const;

const MAX_LINES = 40;

type Violation = {
  file: string;
  rule: "NOT_THIN_ADAPTER";
  lines: number;
  hint: string;
};

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

function isPureReExport(src: string): boolean {
  // Strip line/block comments and blank lines, then check that every remaining
  // line is an `export { ... } from "..."` or `export * from "..."` statement.
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (stripped.length === 0) return false;
  return stripped.every((l) =>
    /^export\s+(\*|\{[^}]*\})\s+from\s+["'][^"']+["'];?$/.test(l) ||
    /^export\s+\{[^}]*\};?$/.test(l),
  );
}

function logicalLines(src: string): number {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"))
    .length;
}

function main() {
  const violations: Violation[] = [];
  for (const sub of PILLAR_PAGE_DIRS) {
    const dir = join(PAGES_DIR, sub);
    let stat: { isDirectory: () => boolean } | null = null;
    try {
      stat = statSync(dir);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;
    for (const f of walk(dir)) {
      const src = readFileSync(f, "utf8");
      if (isPureReExport(src)) continue;
      const lines = logicalLines(src);
      if (lines <= MAX_LINES) continue;
      violations.push({
        file: relative(ROOT, f),
        rule: "NOT_THIN_ADAPTER",
        lines,
        hint: `Move body to src/modules/${sub === "money" || sub === "investment-office" ? "finance" : sub === "revenue-office" || sub === "digital-presence" ? "business" : sub}/pages/ and replace with: export { default } from "@/modules/.../<X>";`,
      });
    }
  }

  if (violations.length === 0) {
    console.log("✅ Pages thin-adapter: OK (0 violations across", PILLAR_PAGE_DIRS.length, "pillar dirs)");
    process.exit(0);
  }

  console[STRICT ? "error" : "warn"](
    `${STRICT ? "❌" : "⚠️"} Pages thin-adapter: ${violations.length} violation(s) (mode=${STRICT ? "STRICT" : "WARN"})`,
  );
  for (const v of violations.slice(0, 50)) {
    console[STRICT ? "error" : "warn"](
      `  [${v.rule}] ${v.file} (${v.lines} lines) → ${v.hint}`,
    );
  }
  if (violations.length > 50) {
    console[STRICT ? "error" : "warn"](`  … and ${violations.length - 50} more`);
  }
  process.exit(STRICT ? 1 : 0);
}

main();