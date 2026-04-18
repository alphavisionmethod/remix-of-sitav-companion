// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Registry
// Registry of every orchestration class + legacy migration map
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationLayer } from "./orchestration-types";

export type MigrationStatus = "canonical" | "adapted" | "wrapped" | "deprecated" | "removed";

export interface LegacyOrchestratorEntry {
  legacyName: string;
  legacyPath: string;
  newRole: string;
  canonicalOwner: string;
  canonicalLayer: OrchestrationLayer | "adapter" | "projection" | "type-only" | "barrel";
  migrationStatus: MigrationStatus;
  notes: string;
}

export const LEGACY_ORCHESTRATOR_MAP: LegacyOrchestratorEntry[] = [
  {
    legacyName: "canonical-chain-orchestrator",
    legacyPath: "src/lib/core-services/canonical-chain-orchestrator.ts",
    newRole: "Internal execution implementation — facade delegates to it",
    canonicalOwner: "orchestration-facade",
    canonicalLayer: "execution",
    migrationStatus: "adapted",
    notes: "Promoted as internal execution engine. Public API replaced by orchestration-facade.",
  },
  {
    legacyName: "brain-core/orchestrate-intent",
    legacyPath: "src/lib/brain-core/orchestrate-intent.ts",
    newRole: "Decision-support helper (parseIntent, chooseExecutionMode, buildExplanation)",
    canonicalOwner: "intent-orchestrator",
    canonicalLayer: "intent",
    migrationStatus: "adapted",
    notes: "Orchestration ownership removed. Intent layer imports helpers only.",
  },
  {
    legacyName: "intent-orchestrator-service",
    legacyPath: "src/lib/services/intent-orchestrator/intent-orchestrator.ts",
    newRole: "Intent classification + routing engine",
    canonicalOwner: "intent-orchestrator",
    canonicalLayer: "intent",
    migrationStatus: "adapted",
    notes: "Core classification logic preserved. Integrated into canonical intent layer.",
  },
  {
    legacyName: "agent-orchestrator",
    legacyPath: "src/lib/core-services/agent-orchestrator.ts",
    newRole: "Execution adapter for agent-style work dispatch",
    canonicalOwner: "execution-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "Fleet lifecycle kept. Orchestration verbs removed. Execution layer dispatches to it.",
  },
  {
    legacyName: "workforce-orchestrator",
    legacyPath: "src/lib/services/ai-workforce/workforce-orchestrator.ts",
    newRole: "Execution adapter for AI role invocation",
    canonicalOwner: "execution-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "DB-backed role invocation kept. Subordinate to execution layer.",
  },
  {
    legacyName: "council-orchestrator",
    legacyPath: "src/lib/services/council-orchestrator/index.ts",
    newRole: "Multi-advisor synthesis (intent support)",
    canonicalOwner: "intent-orchestrator",
    canonicalLayer: "intent",
    migrationStatus: "adapted",
    notes: "Deliberation logic kept. Decision-support only, no execution.",
  },
  {
    legacyName: "founder-orchestrator",
    legacyPath: "src/lib/services/founder-orchestrator/index.ts",
    newRole: "Mode/policy adapter for founder directives",
    canonicalOwner: "planning-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "Directive parsing kept as planning support. Not independent orchestrator.",
  },
  {
    legacyName: "ecosystem-orchestrator",
    legacyPath: "src/lib/services/ecosystem-orchestrator/index.ts",
    newRole: "Cross-device continuity adapter",
    canonicalOwner: "execution-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "Sync/presence kept. Business decision logic removed.",
  },
  {
    legacyName: "operating-autopilot",
    legacyPath: "src/lib/services/operating-autopilot/index.ts",
    newRole: "Policy profile for automation rules",
    canonicalOwner: "planning-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "Rule definitions kept. Not execution authority.",
  },
  {
    legacyName: "os-orchestration",
    legacyPath: "src/lib/services/os-orchestration/index.ts",
    newRole: "Barrel re-export only",
    canonicalOwner: "none",
    canonicalLayer: "barrel",
    migrationStatus: "wrapped",
    notes: "Already just re-exports. No change needed.",
  },
  {
    legacyName: "orchestration-pipeline",
    legacyPath: "src/lib/services/orchestration-pipeline/",
    newRole: "Signal transport + advisor routing (feeds intent layer)",
    canonicalOwner: "intent-orchestrator",
    canonicalLayer: "intent",
    migrationStatus: "adapted",
    notes: "Signal-emitter, advisor-consumer, board-synthesizer feed into intent layer.",
  },
  {
    legacyName: "proof-orchestrator-service",
    legacyPath: "src/lib/services/proof-orchestrator/index.ts",
    newRole: "Proof layer implementation",
    canonicalOwner: "proof-orchestrator",
    canonicalLayer: "proof",
    migrationStatus: "adapted",
    notes: "Absorbed into canonical proof/proof-orchestrator.ts.",
  },
  {
    legacyName: "setup-orchestration-engine",
    legacyPath: "src/lib/services/setup-orchestration-engine.ts",
    newRole: "Domain-scoped planning adapter for setup flows",
    canonicalOwner: "planning-orchestrator",
    canonicalLayer: "adapter",
    migrationStatus: "adapted",
    notes: "DAG logic kept. Aligned with canonical intent→plan→execute→proof.",
  },
  {
    legacyName: "advisor-orchestration",
    legacyPath: "src/lib/architecture/advisor-orchestration.ts",
    newRole: "Type definitions only",
    canonicalOwner: "none",
    canonicalLayer: "type-only",
    migrationStatus: "canonical",
    notes: "Already pure types. No change needed.",
  },
  {
    legacyName: "boardroom-service",
    legacyPath: "src/lib/services/boardroom-service/",
    newRole: "Read-model projection (consumes orchestration outputs)",
    canonicalOwner: "proof-orchestrator",
    canonicalLayer: "projection",
    migrationStatus: "adapted",
    notes: "Packet composition kept. Forbidden from executing or planning.",
  },
];

export function getLegacyEntry(legacyName: string): LegacyOrchestratorEntry | undefined {
  return LEGACY_ORCHESTRATOR_MAP.find(e => e.legacyName === legacyName);
}

export function getEntriesByLayer(layer: OrchestrationLayer): LegacyOrchestratorEntry[] {
  return LEGACY_ORCHESTRATOR_MAP.filter(e => e.canonicalLayer === layer);
}

export function getMigrationReport(): Record<MigrationStatus, number> {
  const report: Record<MigrationStatus, number> = {
    canonical: 0, adapted: 0, wrapped: 0, deprecated: 0, removed: 0,
  };
  for (const entry of LEGACY_ORCHESTRATOR_MAP) {
    report[entry.migrationStatus]++;
  }
  return report;
}
