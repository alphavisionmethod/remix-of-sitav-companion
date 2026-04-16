/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — Context Membership (Phase 9)
// Asserts every edge function, service, and table is owned by exactly
// one bounded context, and emits the membership manifest.
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname } from "node:path";
import { BOUNDED_CONTEXT_REGISTRY } from "../../../src/lib/architecture/bounded-context-registry";
import {
  ROUTE_CONTEXT_BINDINGS,
  findDuplicateMemberships,
  membershipStats,
  resolveEdgeFunctionContext,
} from "../../../src/lib/architecture/context-membership-map";

const issues: { kind: string; identifier: string; reason: string }[] = [];

// 1. Duplicates
const duplicates = findDuplicateMemberships();
for (const d of duplicates) {
  issues.push({
    kind: d.kind,
    identifier: d.identifier,
    reason: `Assigned to multiple contexts: ${d.contextIds.join(", ")}`,
  });
}

// 2. Edge functions on disk that aren't claimed by any context
const fnDir = "supabase/functions";
if (existsSync(fnDir)) {
  for (const entry of readdirSync(fnDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    if (!resolveEdgeFunctionContext(entry.name)) {
      issues.push({
        kind: "edge-function",
        identifier: entry.name,
        reason: "Function exists on disk but no bounded context claims it",
      });
    }
  }
}

const stats = membershipStats();

const manifest = {
  generatedAt: new Date().toISOString(),
  routeBindings: ROUTE_CONTEXT_BINDINGS,
  contextCount: BOUNDED_CONTEXT_REGISTRY.length,
  stats,
  issues,
  ok: issues.length === 0,
};

const out = "generated/context-membership-manifest.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(manifest, null, 2), "utf-8");

console.log(`Context membership: ${stats.routesBound} routes, ${stats.edgeFunctions} fns, ${stats.services} services, ${stats.tables} tables`);
console.log(`  duplicates: ${duplicates.length}, total issues: ${issues.length}`);
console.log(`  → ${out}`);

if (issues.length > 0) {
  console.error("❌ Issues:");
  for (const i of issues) console.error(`   - [${i.kind}] ${i.identifier}: ${i.reason}`);
  process.exit(1);
}
console.log("✅ Pass");
