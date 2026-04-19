#!/usr/bin/env node
/* eslint-disable no-console */
// Admin & Validation Closure — museum-board guard
// Scans src/pages/admin/ai-runtime/** and src/components/admin/ai-runtime/**.
// Every file containing a status display (Card+Badge or Card+Alert) must also
// contain at least one actionable element (Button onClick, useNavigate, Link, or
// supabase.functions.invoke).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport } from "./_lib/emit-gate-report";

const ROOTS = ["src/pages/admin/ai-runtime", "src/components/admin/ai-runtime"];
const issues: Array<{ severity: "error" | "warning"; area: string; message: string }> = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const files = ROOTS.flatMap(walk);
let scanned = 0;
let museum = 0;

for (const f of files) {
  const src = readFileSync(f, "utf-8");
  // Has status display?
  const hasStatus = /\bBadge\b|\bAlert\b|\bstatusText\b|status-/i.test(src) && /\bCard\b|\bCardContent\b/.test(src);
  if (!hasStatus) continue;
  scanned++;
  const hasAction =
    /<Button[^>]*onClick=/.test(src) ||
    /useNavigate\s*\(/.test(src) ||
    /<Link\b/.test(src) ||
    /supabase\.functions\.invoke\(/.test(src) ||
    /onClick=\{/.test(src);
  if (!hasAction) {
    museum++;
    issues.push({ severity: "error", area: f, message: "Card with status display has no actionable element (Button/Link/navigate/invoke)" });
  }
}

const ok = museum === 0;
emitGateReport({ gate: "no-museum-boards", ok, issues, extra: { filesScanned: scanned, museumViolations: museum } });
console.log(`${ok ? "✅" : "❌"} no-museum-boards: ${scanned} status-bearing files scanned, ${museum} museum violation(s) [BLOCK]`);
process.exit(ok ? 0 : 1);
