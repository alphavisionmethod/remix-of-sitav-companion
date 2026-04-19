#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Validator: No Kernel Overclaim
// Forbids over-claiming kernel ownership outside permitted zones.
// Permitted zones (where the phrases may appear because they describe
// the GAP itself): docs/architecture/native-os-future/, archive/,
// scripts/validation/ (this file), generated/.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const FORBIDDEN_PHRASES = [
  /\breal\s+kernel\b/i,
  /\btrue\s+kernel\s+ownership\b/i,
  /\bOS-level\s+kernel\b/i,
  /\bwe\s+(?:built|own|ship)\s+(?:the\s+)?kernel\b/i,
  /\bcustom\s+kernel\s+(?:ownership|substrate)\b/i,
  /\bnative\s+OS\s+kernel\s+(?:we|sita)\s+(?:built|own)\b/i,
];

const PERMITTED_ROOTS = [
  "docs/architecture/native-os-future/",
  "archive/",
  "scripts/validation/",
  "generated/",
  "node_modules/",
  ".git/",
];

const SCAN_ROOTS = ["src", "docs", "supabase/functions", "README.md"];
const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];

function isPermitted(p: string): boolean {
  return PERMITTED_ROOTS.some((r) => p.startsWith(r));
}

function walk(d: string): string[] {
  const out: string[] = [];
  if (!existsSync(d)) return out;
  let s;
  try {
    s = statSync(d);
  } catch {
    return out;
  }
  if (!s.isDirectory()) return [d];
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (isPermitted(p)) continue;
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|md|mdx)$/.test(p)) out.push(p);
  }
  return out;
}

let scanned = 0;
let violations = 0;
for (const root of SCAN_ROOTS) {
  for (const f of walk(root)) {
    if (isPermitted(f)) continue;
    scanned++;
    const src = readFileSync(f, "utf8");
    const stripped = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const rx of FORBIDDEN_PHRASES) {
      if (rx.test(stripped)) {
        violations++;
        issues.push({
          severity: "error",
          area: f,
          message: `Kernel overclaim phrase: matches ${rx.source}`,
        });
        break;
      }
    }
  }
}

const ok = violations === 0;
emitGateReport({
  gate: "no-kernel-overclaim",
  ok,
  issues,
  extra: { scanned, violations, permittedRoots: PERMITTED_ROOTS },
});
console.log(`[no-kernel-overclaim] ${ok ? "PASS" : "FAIL"} (${violations} overclaim phrases / ${scanned} files)`);
process.exit(ok ? 0 : 1);
