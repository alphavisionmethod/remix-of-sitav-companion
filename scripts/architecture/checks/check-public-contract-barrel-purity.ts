#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Public Contract Barrel Purity (Wave 1.2, BLOCKING)
//
// Enforces Rule 40: src/contracts/** is a pure public re-export
// barrel. Files MAY only contain re-export statements
// (`export ... from "..."` / `export type ... from "..."`). They
// MUST NOT contain implementation bodies, nor import from forbidden
// upstream layers.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/contracts";
const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(e)) {
      acc.push(full);
    }
  }
  return acc;
}

const FORBIDDEN_IMPORT_SOURCES = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^@\/integrations\/supabase/,
  /^@\/lib\/services(\/|$)/,
  /^@\/components(\/|$)/,
  /^@\/pages(\/|$)/,
  /^@\/hooks(\/|$)/,
  /^@\/contexts(\/|$)/,
  /^@\/modules(\/|$)/,
];

// Allowed: import sources for re-exports must be one of these
const ALLOWED_REEXPORT_SOURCES = [
  /^@\/packages(\/|$)/,
  /^@\/platform\/[^/]+\/contracts(\/|$)/,
  /^\.\.?\//, // local sibling re-exports inside src/contracts/
];

interface Violation {
  file: string;
  kind: "implementation-body" | "forbidden-import" | "non-reexport-import";
  line: number;
  detail: string;
}

const violations: Violation[] = [];

// Patterns that indicate an implementation body (not a re-export)
const BODY_PATTERNS: Array<[RegExp, string]> = [
  [/^\s*export\s+(?:async\s+)?function\s+\w+/, "function declaration"],
  [/^\s*export\s+class\s+\w+/, "class declaration"],
  [/^\s*export\s+interface\s+\w+/, "interface declaration"],
  [/^\s*export\s+enum\s+\w+/, "enum declaration"],
  // export const FOO = <value> (not = re-export); allow `export const FOO = require(...)` if any
  [/^\s*export\s+const\s+\w+\s*[:=]/, "const value declaration"],
  [/^\s*export\s+let\s+\w+/, "let declaration"],
  [/^\s*export\s+var\s+\w+/, "var declaration"],
  [/^\s*export\s+default\s+(?!from)/, "default export of value"],
];

// Re-export forms allowed
// `export * from "..."` `export { X } from "..."` `export type { X } from "..."` `export type * from "..."` `export type * as X from "..."`
const REEXPORT_PATTERN = /^\s*export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+["']([^"']+)["']/;
const IMPORT_PATTERN = /^\s*import\b[^"']*["']([^"']+)["']/;

for (const file of walk(ROOT)) {
  const rel = relative(".", file);
  // Skip MANIFEST.md handled elsewhere; only .ts/.tsx scanned
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) continue;

    // Detect bare `import` (not allowed inside a pure re-export barrel)
    const importMatch = raw.match(IMPORT_PATTERN);
    if (importMatch) {
      const src = importMatch[1];
      for (const pat of FORBIDDEN_IMPORT_SOURCES) {
        if (pat.test(src)) {
          violations.push({ file: rel, kind: "forbidden-import", line: i + 1, detail: src });
        }
      }
      // Bare imports are allowed only if they come from an allowed re-export source
      if (!ALLOWED_REEXPORT_SOURCES.some((p) => p.test(src))) {
        violations.push({ file: rel, kind: "non-reexport-import", line: i + 1, detail: src });
      }
      continue;
    }

    // Detect implementation body
    const isReexport = REEXPORT_PATTERN.test(raw);
    if (isReexport) {
      // verify re-export source is allowed
      const m = raw.match(REEXPORT_PATTERN);
      const src = m?.[1] ?? "";
      if (!ALLOWED_REEXPORT_SOURCES.some((p) => p.test(src))) {
        violations.push({ file: rel, kind: "non-reexport-import", line: i + 1, detail: src });
      }
      continue;
    }

    for (const [pat, label] of BODY_PATTERNS) {
      if (pat.test(raw)) {
        // Allow `export {}` (empty re-export placeholder)
        if (/^\s*export\s+\{\s*\}\s*;?\s*$/.test(raw)) break;
        // Allow `export type X = ...` only if it's literally the empty `export {}`; otherwise body
        violations.push({ file: rel, kind: "implementation-body", line: i + 1, detail: label });
        break;
      }
    }
  }
}

const ok = violations.length === 0;
const report = {
  generatedAt: new Date().toISOString(),
  gate: "public-contract-barrel-purity",
  scanRoot: ROOT,
  level: "block",
  ok,
  violationCount: violations.length,
  violations: violations.slice(0, 200),
};
writeFileSync(join(OUT_DIR, "public-contract-barrel-purity-report.json"), JSON.stringify(report, null, 2));
console.log(
  `public-contract-barrel-purity: ${violations.length} violation(s) under ${ROOT} — ${ok ? "OK" : "BLOCK"}`,
);
process.exit(ok ? 0 : 1);