#!/usr/bin/env -S deno run --allow-read
// ════════════════════════════════════════════════════════════
// SITA OS — Trust Coverage Check (Phase 5)
// ════════════════════════════════════════════════════════════
// Flags TS/TSX files that:
//   - call supabase.from(...).insert(...) or .update(...) or .delete(...)
//   - are NOT inside src/modules/_trust/**
//   - do NOT co-locate a useTrustEmit / TrustBoundary / TrustActionButton
//     reference (which would route the mutation through the Trust layer).
//
// Run via: bun scripts/architecture/check-trust-coverage.ts
// Exit code: 0 = clean, 1 = uncovered mutations found.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src";
const MUTATION_RE = /supabase[\s\S]{0,40}\.from\([^)]+\)[\s\S]{0,80}\.(insert|update|delete)\(/g;
const TRUST_HINT_RE =
  /(useTrustEmit|TrustBoundary|TrustActionButton|emitTrustReceipt|openTrustApproval|emitRegisteredTrustAction)/;

// Allowlist: areas that legitimately bypass the Trust layer (the layer
// itself, generated types, edge functions, trust-internal admin tools).
const ALLOW_PREFIXES = [
  "src/modules/_trust",
  "src/integrations/supabase",
  "src/pages/trust", // Trust Center surfaces directly persist trust rows
  "src/services/trust",
  "src/lib/trust",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

function isAllowed(path: string): boolean {
  const rel = relative(".", path).replace(/\\/g, "/");
  return ALLOW_PREFIXES.some((p) => rel.startsWith(p));
}

function main(): number {
  const files = walk(ROOT);
  const violations: { file: string; ops: string[] }[] = [];

  for (const file of files) {
    if (isAllowed(file)) continue;
    const src = readFileSync(file, "utf8");
    const matches = [...src.matchAll(MUTATION_RE)];
    if (matches.length === 0) continue;
    if (TRUST_HINT_RE.test(src)) continue;
    violations.push({
      file: relative(".", file).replace(/\\/g, "/"),
      ops: matches.map((m) => m[1]),
    });
  }

  if (violations.length === 0) {
    console.log("✓ Trust coverage clean — every direct mutation is co-located with a Trust hook.");
    return 0;
  }

  console.error(`✗ Trust coverage gaps in ${violations.length} file(s):`);
  for (const v of violations.slice(0, 50)) {
    console.error(`  ${v.file}  [${[...new Set(v.ops)].join(", ")}]`);
  }
  if (violations.length > 50) {
    console.error(`  …and ${violations.length - 50} more.`);
  }
  console.error(
    "\nFix: wrap the mutation in <TrustBoundary> / <TrustActionButton>, or call useTrustEmit() in the same file.",
  );
  return 1;
}

process.exit(main());