/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Edge Function Membership Completeness (Phase 10)
// Walks supabase/functions/*/index.ts and fails if any function
// is not claimed by exactly one bounded context.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";

const FUNCTIONS_DIR = "supabase/functions";
const REPORT_PATH = "generated/edge-function-membership-report.json";
const SHARED_DIRS = new Set(["_shared", "_tests", "shared", "_lib"]);

function listEdgeFunctions(): string[] {
  if (!existsSync(FUNCTIONS_DIR)) return [];
  return readdirSync(FUNCTIONS_DIR)
    .filter((name) => {
      if (SHARED_DIRS.has(name)) return false;
      if (name.startsWith(".")) return false;
      const full = join(FUNCTIONS_DIR, name);
      try {
        return statSync(full).isDirectory() && existsSync(join(full, "index.ts"));
      } catch { return false; }
    })
    .sort();
}

const onDisk = listEdgeFunctions();
const claimed = new Map<string, string[]>();
for (const ctx of BOUNDED_CONTEXT_REGISTRY) {
  for (const fn of ctx.edgeFunctions) {
    if (!claimed.has(fn)) claimed.set(fn, []);
    claimed.get(fn)!.push(ctx.contextId);
  }
}

const orphans = onDisk.filter((fn) => !claimed.has(fn));
const ghosts = [...claimed.keys()].filter((fn) => !onDisk.includes(fn));
const duplicates = [...claimed.entries()]
  .filter(([, ctxs]) => ctxs.length > 1)
  .map(([fn, ctxs]) => ({ fn, ctxs }));

const report = {
  generatedAt: new Date().toISOString(),
  totalOnDisk: onDisk.length,
  totalClaimed: claimed.size,
  orphans,
  ghosts,
  duplicates,
  ok: orphans.length === 0 && ghosts.length === 0 && duplicates.length === 0,
};

mkdirSync("generated", { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`Edge functions on disk: ${onDisk.length}, claimed: ${claimed.size}`);
if (orphans.length > 0) {
  console.error(`❌ ${orphans.length} unclaimed edge functions:`);
  for (const o of orphans) console.error(`   - ${o}`);
}
if (ghosts.length > 0) {
  console.error(`❌ ${ghosts.length} ghost claims (in registry but not on disk):`);
  for (const g of ghosts) console.error(`   - ${g}`);
}
if (duplicates.length > 0) {
  console.error(`❌ ${duplicates.length} duplicate claims:`);
  for (const d of duplicates) console.error(`   - ${d.fn} → ${d.ctxs.join(", ")}`);
}

if (!report.ok) process.exit(1);
console.log("✅ Pass");
