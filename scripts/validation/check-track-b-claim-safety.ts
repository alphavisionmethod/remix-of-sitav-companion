#!/usr/bin/env node
/* eslint-disable no-console */
// Track B claim-safety: ensures Track B docs use Runtime SDK language, not Kernel claims.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["docs/track-b", "generated/final-hardening"];
const FORBIDDEN = /Nova Kernel/g;
const ALLOWED_FILES = new Set([
  "generated/final-hardening/NOVA_RENAME_REFERENCE_AUDIT.md",
  "generated/final-hardening/NOVA_RENAME_TARGET_MODEL.md",
  "generated/final-hardening/NOVA_CLAIM_SAFETY_UPDATE.md",
]);

const issues: string[] = [];
function walk(dir: string) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(md|mdx)$/.test(f)) continue;
    if (ALLOWED_FILES.has(p)) continue;
    const s = readFileSync(p, "utf8");
    if (FORBIDDEN.test(s)) issues.push(p);
  }
}
ROOTS.forEach(walk);
const ok = issues.length === 0;
console.log(`${ok ? "✅" : "❌"} track-b-claim-safety: ${issues.length} doc(s) still use "Nova Kernel"`);
if (!ok) issues.slice(0, 10).forEach(p => console.log("  - " + p));
process.exit(ok ? 0 : 1);
