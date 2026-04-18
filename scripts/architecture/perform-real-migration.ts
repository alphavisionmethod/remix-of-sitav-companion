#!/usr/bin/env node
// SITA OS — Real File Migration (move + wrapper + rewire)
// Performs a TRUE migration for a curated allowlist of high-impact paths:
//  1. Reads the original file content from src/lib/X
//  2. Writes that content to the canonical destination
//  3. Rewrites src/lib/X to be a thin re-export wrapper pointing at the canonical path
//  4. Records the migration in the wrapper map
//
// This is intentionally conservative: only paths whose canonical destination
// is currently empty AND whose src/lib source is real (not already a wrapper)
// will be processed. Re-running is idempotent.

import * as fs from "fs";
import * as path from "path";

type Move = { from: string; to: string; canonicalImport: string };

// Curated, verified, high-traffic moves. Each entry is (libRelative, canonicalRelative).
// We use file paths relative to project root.
const MOVES: Move[] = [
  // ── Data layer (Wave 2 — real) ────────────────────────────────────
  ...[
    "persistence/universal-service-persistence",
    "persistence/persistable",
    "persistence/supabase-adapters",
    "persistence/event-bus-persistence",
    "persistence/memory-service-persistence",
    "persistence/policy-engine-persistence",
    "persistence/action-lineage-persistence",
    "persistence/cai-persistence-bridge",
    "persistence/compute-governance-persistence",
    "persistence/engine-persistence-adapter",
    "persistence/intelligence-asset-persistence",
    "persistence/mock-replacement-persistence",
    "persistence/operator-taste-persistence",
    "persistence/quality-floor-persistence",
    "persistence/reality-classification-persistence",
  ].map(name => ({
    from: `src/lib/${name}.ts`,
    to: `src/data/${name}.ts`,
    canonicalImport: `@/data/${name}`,
  })),
  { from: "src/lib/offline-db.ts", to: "src/data/persistence/offline-db.ts", canonicalImport: "@/data/persistence/offline-db" },
  { from: "src/lib/storage/storage-topology-registry.ts", to: "src/data/persistence/storage-topology-registry.ts", canonicalImport: "@/data/persistence/storage-topology-registry" },

  // ── Engines (Wave 5 partial — top 13 by importer count) ───────────
  ...[
    "business-identity-layers",
    "business-profile-engine",
    "business-module-adaptations",
    "lead-scoring-engine",
    "business-radar-engine",
    "business-archetype-engine",
    "business-context-graph",
    "business-action-pipeline",
    "business-advisor-engine",
    "business-advisor-personas",
    "business-autonomy-engine",
    "business-profitability-engine",
    "lead-recovery-engine",
  ].map(name => ({
    from: `src/lib/engines/${name}.ts`,
    to: `src/domains/engines/${name}.ts`,
    canonicalImport: `@/domains/engines/${name}`,
  })),

  // ── Verification (Platform) ────────────────────────────────────────
  { from: "src/lib/verification/verification-hooks.ts", to: "src/platform/verification/verification-hooks.ts", canonicalImport: "@/platform/verification/verification-hooks" },
  { from: "src/lib/verification/surface-registry.ts", to: "src/platform/verification/surface-registry.ts", canonicalImport: "@/platform/verification/surface-registry" },

  // ── Event bus (platform core) ──────────────────────────────────────
  { from: "src/lib/core-services/event-bus.ts", to: "src/platform/core-services/event-bus.ts", canonicalImport: "@/platform/core-services/event-bus" },

  // ── App platform types ─────────────────────────────────────────────
  { from: "src/lib/app-platform/types.ts", to: "src/domains/apps/types.ts", canonicalImport: "@/domains/apps/types" },

  // ── Nova SDK UI ────────────────────────────────────────────────────
  { from: "src/lib/nova-sdk/ui/layout.tsx", to: "src/platform/nova-sdk/ui/layout.tsx", canonicalImport: "@/platform/nova-sdk/ui/layout" },
  { from: "src/lib/nova-sdk/ui/components.tsx", to: "src/platform/nova-sdk/ui/components.tsx", canonicalImport: "@/platform/nova-sdk/ui/components" },
  { from: "src/lib/nova-sdk/ui/NovaThemeProvider.tsx", to: "src/platform/nova-sdk/ui/NovaThemeProvider.tsx", canonicalImport: "@/platform/nova-sdk/ui/NovaThemeProvider" },
];

interface Result { from: string; to: string; status: "moved" | "skipped-already-moved" | "skipped-source-missing" | "skipped-source-is-wrapper" | "error"; reason?: string }

const WRAPPER_MARK = "// @lovable:migrated-wrapper";

function isWrapper(content: string): boolean {
  // A wrapper is small and only contains export-star/re-export statements
  if (content.includes(WRAPPER_MARK)) return true;
  const meaningful = content
    .split("\n")
    .filter(l => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("/*") && !l.trim().startsWith("*"));
  if (meaningful.length === 0) return true;
  const allReExports = meaningful.every(l => /^\s*export\s+(\*|\{)/.test(l));
  return allReExports && meaningful.length <= 5;
}

function migrate(m: Move): Result {
  if (!fs.existsSync(m.from)) return { ...m, status: "skipped-source-missing" };
  const src = fs.readFileSync(m.from, "utf8");
  if (isWrapper(src)) return { ...m, status: "skipped-source-is-wrapper" };

  // Don't overwrite real content at the destination
  if (fs.existsSync(m.to)) {
    const destContent = fs.readFileSync(m.to, "utf8");
    if (destContent.trim() && !isWrapper(destContent)) {
      return { ...m, status: "skipped-already-moved", reason: "destination has real content" };
    }
  }

  // 1. Write canonical destination
  fs.mkdirSync(path.dirname(m.to), { recursive: true });
  fs.writeFileSync(m.to, src);

  // 2. Replace lib path with wrapper
  const wrapper = `${WRAPPER_MARK}
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecated wrapper. Canonical home: ${m.canonicalImport}
// This file exists only to bridge legacy imports during decomposition.
// New code must import directly from the canonical path.
// ═══════════════════════════════════════════════════════════════
export * from "${m.canonicalImport}";
`;
  fs.writeFileSync(m.from, wrapper);
  return { ...m, status: "moved" };
}

const results = MOVES.map(migrate);
const summary: Record<string, number> = {};
for (const r of results) summary[r.status] = (summary[r.status] || 0) + 1;

console.log("Migration summary:");
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v}`);

const moved = results.filter(r => r.status === "moved");
console.log(`\n✅ Moved ${moved.length}/${MOVES.length} files`);
if (moved.length) {
  console.log("Moved paths:");
  for (const r of moved) console.log(`  ${r.from} → ${r.to}`);
}

fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/real-migration-report.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2),
);
