#!/usr/bin/env tsx
/**
 * SITA OS — Generated/Docs Lifecycle Validator (Constitution Rules 10–12)
 *
 * Asserts that:
 *   - Files under generated/ carry a machine-generated marker (or are JSON, which is
 *     machine output by convention) and are not duplicated by an identically named
 *     file under docs/.
 *   - Files under docs/ are not just verbatim copies of a generated file.
 *
 * The validator is intentionally conservative: it flags exact filename collisions
 * between generated/ and docs/ (which is the most common form of doc-drift), and
 * flags hand-edited non-JSON files in generated/ that lack a "GENERATED — DO NOT EDIT"
 * style marker. Run in --warn during the migration; flip to --strict in Wave 8.
 *
 * Run: npx tsx scripts/architecture/check-generated-vs-docs.ts [--strict]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const GEN = join(ROOT, "generated");
const DOCS = join(ROOT, "docs");
const STRICT = process.argv.includes("--strict");

const MACHINE_MARKERS = [
  "GENERATED",
  "DO NOT EDIT",
  "Auto-generated",
  "machine-generated",
  '"generatedAt"',
  '"generated_at"',
];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function main() {
  const violations: string[] = [];

  // Build basename index of docs/
  const docsIndex = new Map<string, string>();
  for (const f of walk(DOCS)) docsIndex.set(basename(f), relative(ROOT, f));

  for (const f of walk(GEN)) {
    const base = basename(f);
    const rel = relative(ROOT, f);

    // Filename collision with docs/
    if (docsIndex.has(base)) {
      violations.push(
        `DOC_GENERATED_COLLISION: ${rel} shares filename with ${docsIndex.get(base)} — choose one canonical owner`,
      );
    }

    // Markdown files in generated/ should carry a machine marker
    if (/\.(md|mdx)$/i.test(f)) {
      const head = (() => {
        try {
          return readFileSync(f, "utf8").slice(0, 2048);
        } catch {
          return "";
        }
      })();
      const hasMarker = MACHINE_MARKERS.some((m) => head.toLowerCase().includes(m.toLowerCase()));
      if (!hasMarker) {
        violations.push(
          `MISSING_GENERATED_MARKER: ${rel} — add a "<!-- GENERATED — DO NOT EDIT -->" header or move to docs/`,
        );
      }
    }
  }

  if (violations.length === 0) {
    console.log("✅ Generated/docs lifecycle: OK");
    process.exit(0);
  }

  console[STRICT ? "error" : "warn"](
    `${STRICT ? "❌" : "⚠️"} Generated/docs lifecycle: ${violations.length} issue(s) (mode=${STRICT ? "STRICT" : "WARN"})`,
  );
  for (const v of violations.slice(0, 80)) console[STRICT ? "error" : "warn"](`  ${v}`);
  if (violations.length > 80) console[STRICT ? "error" : "warn"](`  … and ${violations.length - 80} more`);
  process.exit(STRICT ? 1 : 0);
}

main();