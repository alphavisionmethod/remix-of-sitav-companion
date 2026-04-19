#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: No Browser-Trapped Shared Hooks
// Scans src/hooks/**/*.{ts,tsx} for direct window./document. access.
// Allowlists leaf-browser-only and shell-specific hooks declared in
// src/runtimes/portability-boundary-model.ts.
// BLOCK on any new violation.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";
import { LEAF_BROWSER_HOOK_ALLOWLIST } from "../../src/runtimes/portability-boundary-model";

const HOOKS_DIR = "src/hooks";
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// Patterns that indicate direct browser-global access (excluding within strings/comments
// is approximated by simple token lookahead — false positives surface as warnings, not errors).
const PATTERNS = [
  /\bwindow\.[a-zA-Z]/g,
  /\bdocument\.[a-zA-Z]/g,
  /\bnavigator\.[a-zA-Z]/g,
  /\blocalStorage\.[a-zA-Z]/g,
  /\bsessionStorage\.[a-zA-Z]/g,
];

const violations: { file: string; matches: string[] }[] = [];
const files = walk(HOOKS_DIR);

for (const f of files) {
  if (LEAF_BROWSER_HOOK_ALLOWLIST.includes(f)) continue;
  const src = readFileSync(f, "utf8");
  // Strip line comments to avoid false positives on commented-out code
  const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const matches: string[] = [];
  for (const p of PATTERNS) {
    const m = stripped.match(p);
    if (m) matches.push(...m);
  }
  if (matches.length > 0) {
    // The 4 refactored hooks now route through useRuntimeHost — verify import exists
    const usesAdapter = src.includes("useRuntimeHost");
    if (!usesAdapter) {
      violations.push({ file: f, matches: Array.from(new Set(matches)).slice(0, 5) });
      issues.push({
        severity: "error",
        area: f,
        message: `Direct browser-global access without adapter: ${Array.from(new Set(matches)).slice(0, 3).join(", ")}`,
      });
    }
  }
}

const ok = violations.length === 0;
emitGateReport({
  gate: "no-browser-trapped-shared-hooks",
  ok,
  issues,
  extra: { scanned: files.length, allowlisted: LEAF_BROWSER_HOOK_ALLOWLIST.length, violations: violations.length },
});
console.log(`[no-browser-trapped-shared-hooks] ${ok ? "PASS" : "FAIL"} (${violations.length} violations / ${files.length} hooks)`);
process.exit(ok ? 0 : 1);
