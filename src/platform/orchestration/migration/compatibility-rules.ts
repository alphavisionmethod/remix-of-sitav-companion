// ═══════════════════════════════════════════════════════════════
// SITA OS — Compatibility Rules (Migration)
// Rules for backward-compatible wrappers
// ═══════════════════════════════════════════════════════════════

export interface CompatibilityRule {
  legacyImport: string;
  canonicalImport: string;
  wrapperRequired: boolean;
  breakingChanges: string[];
  migrationNotes: string;
}

export const COMPATIBILITY_RULES: CompatibilityRule[] = [
  {
    legacyImport: "@/lib/core-services/canonical-chain-orchestrator",
    canonicalImport: "@/lib/orchestration/orchestration-facade",
    wrapperRequired: true,
    breakingChanges: ["execute() → processIntent()", "Input shape changed to ProcessIntentRequest"],
    migrationNotes: "Replace CanonicalChainOrchestrator.execute() with orchestrationFacade.processIntent()",
  },
  {
    legacyImport: "@/lib/services/intent-orchestrator/intent-orchestrator",
    canonicalImport: "@/lib/orchestration/intent/intent-orchestrator",
    wrapperRequired: false,
    breakingChanges: ["IntentOrchestratorService → CanonicalIntentOrchestrator"],
    migrationNotes: "Import canonicalIntentOrchestrator from orchestration/intent/",
  },
  {
    legacyImport: "@/lib/core-services/agent-orchestrator",
    canonicalImport: "@/lib/orchestration/execution/job-dispatcher",
    wrapperRequired: true,
    breakingChanges: ["Agent scheduling now goes through execution layer"],
    migrationNotes: "Use dispatchJob() via execution orchestrator instead of direct agent-orchestrator calls",
  },
  {
    legacyImport: "@/lib/services/ai-workforce/workforce-orchestrator",
    canonicalImport: "@/lib/orchestration/execution/job-dispatcher",
    wrapperRequired: true,
    breakingChanges: ["Workforce invocation now goes through execution layer"],
    migrationNotes: "Use dispatchJob() via execution orchestrator for AI role invocation",
  },
  {
    legacyImport: "@/lib/services/proof-orchestrator",
    canonicalImport: "@/lib/orchestration/proof/proof-orchestrator",
    wrapperRequired: false,
    breakingChanges: ["ProofOrchestratorService → CanonicalProofOrchestrator"],
    migrationNotes: "Import canonicalProofOrchestrator from orchestration/proof/",
  },
];

export function getCompatibilityRule(legacyImport: string): CompatibilityRule | undefined {
  return COMPATIBILITY_RULES.find(r => legacyImport.includes(r.legacyImport));
}
