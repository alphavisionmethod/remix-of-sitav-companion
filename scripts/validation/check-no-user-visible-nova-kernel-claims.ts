#!/usr/bin/env node
/* eslint-disable no-console */
// Forbids "Nova Kernel" in user-visible TSX/JSX strings.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = "src";
const ALLOWED = /\/(nova-sdk\/kernel|platform\/nova-runtime-sdk)\//;
const issues: string[] = [];
function walk(d: string) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    const st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    if (!/\.(tsx|jsx)$/.test(f)) continue;
    if (ALLOWED.test(p)) continue;
    const s = readFileSync(p, "utf8");
    // Look for the literal in JSX text or string literals
    if (/["'>]\s*Nova Kernel\s*[<"']/.test(s)) issues.push(p);
  }
}
walk(ROOT);
const ok = issues.length === 0;
console.log(`${ok ? "✅" : "❌"} no-user-visible-nova-kernel-claims: ${issues.length} occurrence(s)`);
if (!ok) issues.slice(0, 10).forEach(p => console.log("  - " + p));
process.exit(ok ? 0 : 1);
