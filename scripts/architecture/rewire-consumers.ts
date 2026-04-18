#!/usr/bin/env node
// SITA OS — Consumer Rewire Pass
// For a curated allowlist of canonical destinations, rewrite every consumer
// import that still points at the deprecated src/lib wrapper to the canonical
// path. Wrappers stay on disk (for safety) but their import count drops to 0,
// which directly reduces the legacy-wrapper-usage gate count.
//
// Allowlist is intentionally narrow this pass — only paths whose canonical
// home definitely exists on disk. Each successful rewire is recorded.

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve("src");

// Map deprecated @/lib/* import → canonical path. Verified targets only.
const REWIRE_MAP: Record<string, string> = {
  // data — universal-service-persistence is the heaviest, 121 importers
  "@/lib/persistence/universal-service-persistence": "@/data/persistence/universal-service-persistence",
  "@/lib/persistence/persistable": "@/data/persistence/persistable",
  "@/lib/persistence/supabase-adapters": "@/data/persistence/supabase-adapters",
  "@/lib/persistence/event-bus-persistence": "@/data/persistence/event-bus-persistence",
  "@/lib/persistence/memory-service-persistence": "@/data/persistence/memory-service-persistence",
  "@/lib/persistence/policy-engine-persistence": "@/data/persistence/policy-engine-persistence",
  "@/lib/persistence/action-lineage-persistence": "@/data/persistence/action-lineage-persistence",
  "@/lib/persistence/cai-persistence-bridge": "@/data/persistence/cai-persistence-bridge",
  "@/lib/persistence/compute-governance-persistence": "@/data/persistence/compute-governance-persistence",
  "@/lib/persistence/engine-persistence-adapter": "@/data/persistence/engine-persistence-adapter",
  "@/lib/persistence/intelligence-asset-persistence": "@/data/persistence/intelligence-asset-persistence",
  "@/lib/persistence/mock-replacement-persistence": "@/data/persistence/mock-replacement-persistence",
  "@/lib/persistence/operator-taste-persistence": "@/data/persistence/operator-taste-persistence",
  "@/lib/persistence/quality-floor-persistence": "@/data/persistence/quality-floor-persistence",
  "@/lib/persistence/reality-classification-persistence": "@/data/persistence/reality-classification-persistence",
  "@/lib/offline-db": "@/data/persistence/offline-db",
  "@/lib/storage/storage-topology-registry": "@/data/persistence/storage-topology-registry",

  // engines — second heaviest cluster (business-identity-layers etc.)
  "@/lib/engines/business-identity-layers": "@/domains/engines/business-identity-layers",
  "@/lib/engines/business-profile-engine": "@/domains/engines/business-profile-engine",
  "@/lib/engines/business-module-adaptations": "@/domains/engines/business-module-adaptations",
  "@/lib/engines/lead-scoring-engine": "@/domains/engines/lead-scoring-engine",
  "@/lib/engines/business-radar-engine": "@/domains/engines/business-radar-engine",
  "@/lib/engines/business-archetype-engine": "@/domains/engines/business-archetype-engine",
  "@/lib/engines/business-context-graph": "@/domains/engines/business-context-graph",
  "@/lib/engines/business-action-pipeline": "@/domains/engines/business-action-pipeline",
  "@/lib/engines/business-advisor-engine": "@/domains/engines/business-advisor-engine",
  "@/lib/engines/business-advisor-personas": "@/domains/engines/business-advisor-personas",
  "@/lib/engines/business-autonomy-engine": "@/domains/engines/business-autonomy-engine",
  "@/lib/engines/business-profitability-engine": "@/domains/engines/business-profitability-engine",
  "@/lib/engines/lead-recovery-engine": "@/domains/engines/lead-recovery-engine",

  // verification — UI hooks
  "@/lib/verification/verification-hooks": "@/platform/verification/verification-hooks",
  "@/lib/verification/surface-registry": "@/platform/verification/surface-registry",

  // event-bus — platform core
  "@/lib/core-services/event-bus": "@/platform/core-services/event-bus",

  // app-platform types
  "@/lib/app-platform/types": "@/domains/apps/types",

  // nova-sdk UI
  "@/lib/nova-sdk/ui/layout": "@/platform/nova-sdk/ui/layout",
  "@/lib/nova-sdk/ui/components": "@/platform/nova-sdk/ui/components",
  "@/lib/nova-sdk/ui/NovaThemeProvider": "@/platform/nova-sdk/ui/NovaThemeProvider",
};

// Confirm canonical destination really exists before rewiring
function targetExists(canonical: string): boolean {
  const rel = canonical.replace(/^@\//, "");
  const candidates = [
    path.join("src", `${rel}.ts`),
    path.join("src", `${rel}.tsx`),
    path.join("src", rel, "index.ts"),
    path.join("src", rel, "index.tsx"),
  ];
  return candidates.some(p => fs.existsSync(p));
}

const validatedMap: Record<string, string> = {};
for (const [from, to] of Object.entries(REWIRE_MAP)) {
  if (targetExists(to)) validatedMap[from] = to;
  else console.warn(`⚠ skip ${from} → ${to} (target missing)`);
}

console.log(`Validated rewires: ${Object.keys(validatedMap).length}/${Object.keys(REWIRE_MAP).length}`);

// Walk src/ and rewrite imports
const stats: Record<string, number> = {};
let filesTouched = 0;

function walk(dir: string, fn: (p: string) => void) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      // Skip the shim directory itself — wrappers should keep pointing inward
      if (p.includes(`${path.sep}lib${path.sep}`) || p.endsWith(`${path.sep}lib`)) continue;
      walk(p, fn);
    } else if (/\.(ts|tsx)$/.test(e)) fn(p);
  }
}

walk(ROOT, (file) => {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of Object.entries(validatedMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match in `from "..."` and `from '...'` for static imports + dynamic import("…")
    const re = new RegExp(`(from\\s+['"])${escaped}(['"])`, "g");
    const re2 = new RegExp(`(import\\s*\\(\\s*['"])${escaped}(['"])`, "g");
    let count = 0;
    src = src.replace(re, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    src = src.replace(re2, (_m, a, b) => { count++; return `${a}${to}${b}`; });
    if (count > 0) {
      stats[from] = (stats[from] || 0) + count;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, src);
    filesTouched++;
  }
});

const total = Object.values(stats).reduce((s, n) => s + n, 0);
console.log(`\n✅ Rewired ${total} import sites across ${filesTouched} files\n`);
const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
for (const [k, n] of sorted) console.log(`  ${String(n).padStart(4)}  ${k}`);

// Persist report
fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/consumer-rewire-report.json",
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRewireSites: total,
    filesTouched,
    perPath: stats,
    validatedMap,
  }, null, 2),
);
console.log(`\nReport: generated/lib-decomposition/consumer-rewire-report.json`);
