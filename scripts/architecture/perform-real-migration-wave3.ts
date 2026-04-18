#!/usr/bin/env node
// SITA OS — Real File Migration Wave 3
// Target: remaining standalone files + data-services cluster + smaller hot paths.

import * as fs from "fs";
import * as path from "path";

type Move = { from: string; to: string; canonicalImport: string };

const MOVES: Move[] = [
  // ── Demo data finishers ──────────────────────────────────────────
  { from: "src/lib/demo-data/packs.ts", to: "src/data/seed/packs.ts", canonicalImport: "@/data/seed/packs" },
  { from: "src/lib/demo-data/investment.ts", to: "src/data/seed/investment.ts", canonicalImport: "@/data/seed/investment" },

  // ── Standalone single-file modules ───────────────────────────────
  { from: "src/lib/sound-engine.ts", to: "src/platform/runtime/sound-engine.ts", canonicalImport: "@/platform/runtime/sound-engine" },
  { from: "src/lib/advisor-topology.ts", to: "src/domains/advisors/topology.ts", canonicalImport: "@/domains/advisors/topology" },
  { from: "src/lib/pack-store.ts", to: "src/domains/apps/pack-store.ts", canonicalImport: "@/domains/apps/pack-store" },

  // ── Remaining data-services → src/data/repositories ──────────────
  ...[
    "activity-data-service",
    "admin-data-service",
    "ai-ops-data-service",
    "business-data-service",
    "cai-data-service",
    "calendar-data-service",
    "capability-launch-data-service",
    "connector-ops-data-service",
    "demo-governance-data-service",
    "digital-presence-data-service",
    "feature-lifecycle-data-service",
    "files-data-service",
    "health-signal-data-service",
    "integration-ops-data-service",
    "intelligence-ops-data-service",
    "investment-data-service",
    "investment-ops-data-service",
    "mission-control-data-service",
    "mobile-data-service",
    "money-data-service",
    "native-shell-data-service",
    "notification-calm-data-service",
    "owner-data-service",
    "platform-ops-data-service",
    "revenue-data-service",
    "revenue-ops-data-service",
    "surface-mode-data-service",
    "system-misc-data-service",
    "unified-calendar-service",
    "workspace-data-service",
  ].map(name => ({
    from: `src/lib/data-services/${name}.ts`,
    to: `src/data/repositories/${name}.ts`,
    canonicalImport: `@/data/repositories/${name}`,
  })),

  // ── Remaining engines (next 18 by usage) ─────────────────────────
  ...[
    "advisor-orchestration",
    "advisor-memory-engine",
    "advisor-performance-engine",
    "advisor-reflection-engine",
    "advisor-tool-execution-engine",
    "ai-governance-engine",
    "client-intelligence-engine",
    "confidence-risk-scorer",
    "connector-concierge",
    "continuous-profit-engine",
    "cross-advisor-coordinator",
    "cross-os-integration",
    "decision-journal-engine",
    "delegation-engine",
    "digital-twin",
    "drag-engine",
    "economic-intelligence-engine",
    "enterprise-maturity",
    "entity-role-graph",
    "execution-debt-engine",
    "founder-bottleneck-engine",
    "graph-engine",
    "invisible-labor-engine",
    "memory-governance",
    "meta-governance-engine",
    "playbook-simulator",
    "policy-depth-engine",
    "profile-evolution-engine",
    "readiness-engine",
    "release-engine",
    "replay-recovery",
    "revenue-opportunity",
    "revenue-autopilot",
    "setup-orchestration-engine",
    "setup-phase-definitions",
    "simulation-engine",
    "strategic-planning-engine",
    "token-governance",
    "trust-debt-engine",
    "workspace-view-engine",
    "action-state-machine",
    "adaptive-advisor-roster",
    "adaptive-boardroom-framing",
    "adaptive-notification-engine",
    "adaptive-sidebar-intelligence",
    "adaptive-workflow-templates",
  ].map(name => ({
    from: `src/lib/engines/${name}.ts`,
    to: `src/domains/engines/${name}.ts`,
    canonicalImport: `@/domains/engines/${name}`,
  })),
];

interface Result { from: string; to: string; status: string; reason?: string }
const WRAPPER_MARK = "// @lovable:migrated-wrapper";

function isWrapper(content: string): boolean {
  if (content.includes(WRAPPER_MARK)) return true;
  const meaningful = content.split("\n").filter(l => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("/*") && !l.trim().startsWith("*"));
  if (meaningful.length === 0) return true;
  const allReExports = meaningful.every(l => /^\s*export\s+(\*|\{)/.test(l));
  return allReExports && meaningful.length <= 5;
}

function migrate(m: Move): Result {
  if (!fs.existsSync(m.from)) return { ...m, status: "skipped-source-missing" };
  const src = fs.readFileSync(m.from, "utf8");
  if (isWrapper(src)) return { ...m, status: "skipped-source-is-wrapper" };
  if (fs.existsSync(m.to)) {
    const destContent = fs.readFileSync(m.to, "utf8");
    if (destContent.trim() && !isWrapper(destContent)) {
      return { ...m, status: "skipped-already-moved", reason: "destination has real content" };
    }
  }
  fs.mkdirSync(path.dirname(m.to), { recursive: true });
  fs.writeFileSync(m.to, src);
  const wrapper = `${WRAPPER_MARK}
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecated wrapper. Canonical home: ${m.canonicalImport}
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
console.log("Migration Wave 3 summary:");
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v}`);
const moved = results.filter(r => r.status === "moved");
console.log(`\n✅ Moved ${moved.length}/${MOVES.length} files`);

fs.mkdirSync("generated/lib-decomposition", { recursive: true });
fs.writeFileSync(
  "generated/lib-decomposition/real-migration-wave3-report.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2),
);
