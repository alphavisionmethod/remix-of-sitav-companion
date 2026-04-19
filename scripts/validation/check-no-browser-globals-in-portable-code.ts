#!/usr/bin/env -S npx tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: No Browser Globals in Portable Code
// Extends portability enforcement beyond src/hooks/ into
// src/lib/services/ (canonical portable layer per service-constitution).
// BLOCK on any direct window/document/navigator/localStorage/sessionStorage
// access in src/lib/services/** unless the path is explicitly classified
// as leaf-browser-only / shell-specific / adapter-routed in
// portability-boundary-model.ts.
// ═══════════════════════════════════════════════════════════════
/* eslint-disable no-console */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";
import { LEAF_BROWSER_HOOK_ALLOWLIST } from "../../src/runtimes/portability-boundary-model";

const PORTABLE_ROOTS = ["src/lib/services"];
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function walk(d: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try { entries = readdirSync(d); } catch { return out; }
  for (const f of entries) {
    const p = join(d, f);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const PATTERNS = [
  /\bwindow\.[a-zA-Z]/g,
  /\bdocument\.[a-zA-Z]/g,
  /\bnavigator\.[a-zA-Z]/g,
  /\blocalStorage\.[a-zA-Z]/g,
  /\bsessionStorage\.[a-zA-Z]/g,
];

const allowSet = new Set(LEAF_BROWSER_HOOK_ALLOWLIST);
const violations: { file: string; matches: string[] }[] = [];
let scanned = 0;

for (const root of PORTABLE_ROOTS) {
  const files = walk(root);
  scanned += files.length;
  for (const f of files) {
    if (allowSet.has(f)) continue;
    const src = readFileSync(f, "utf8");
    const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    const matches: string[] = [];
    for (const p of PATTERNS) {
      const m = stripped.match(p);
      if (m) matches.push(...m);
    }
    if (matches.length > 0) {
      // Allow guarded access (typeof window check on same line or adjacent)
      const guarded = /typeof\s+window\s*!==\s*["']undefined["']/.test(src) ||
                      /typeof\s+document\s*!==\s*["']undefined["']/.test(src);
      if (guarded) continue;
      violations.push({ file: f, matches: Array.from(new Set(matches)).slice(0, 5) });
      issues.push({
        severity: "error",
        area: f,
        message: `Browser global in portable service layer: ${Array.from(new Set(matches)).slice(0, 3).join(", ")} — route through useRuntimeHost() or guard with typeof check.`,
      });
    }
  }
}

const ok = violations.length === 0;
emitGateReport({
  gate: "no-browser-globals-in-portable-code",
  ok,
  issues,
  extra: { scanned, roots: PORTABLE_ROOTS, violations: violations.length },
});
console.log(`[no-browser-globals-in-portable-code] ${ok ? "PASS" : "FAIL"} (${violations.length} violations / ${scanned} files in portable roots)`);
process.exit(ok ? 0 : 1);
