#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Behavioral Proof Artifact Generator
// Generates 14 proof artifacts from canonical registries.
// ═══════════════════════════════════════════════════════════════
import { mkdirSync, writeFileSync } from "node:fs";
import { AI_CAPABILITY_REGISTRY } from "../../src/lib/ai/ai-capability-registry";
import { FALLBACK_POLICIES, REPLAY_FAMILIES } from "../../src/lib/ai/ai-fallback-policy";
import { REFUSAL_POLICIES } from "../../src/lib/ai/ai-refusal-policy";
import { AI_SURFACE_EVIDENCE_POLICIES } from "../../src/lib/ai/ai-evidence-grade-policy";
import { ACTION_BOUNDARY_TESTS } from "../../src/lib/ai/ai-action-boundary-tests";
import { PROMPT_DRIFT_CONFIGS } from "../../src/lib/ai/ai-prompt-drift-detection";
import { ROUTING_REPLAY_FAMILIES } from "../../src/lib/ai/ai-routing-replay";
import { RECEIPT_RECONSTRUCTION_MAP } from "../../src/lib/ai/ai-receipt-reconstruction";
import { AI_COST_ANOMALY_RULES } from "../../src/lib/ai/ai-cost-anomaly-detector";
import { OUTAGE_SCENARIOS, simulateOutage } from "../../src/lib/ai/ai-provider-outage-simulator";
import { AUTONOMY_CEILING_MAP } from "../../src/lib/ai/ai-autonomy-ceiling-policy";
import { CROSS_DOMAIN_RESTRICTIONS } from "../../src/lib/ai/ai-cross-domain-restriction-map";
import { MEMORY_REPAIR_ENTRIES } from "../../src/lib/ai/ai-memory-repair-manager";
import { BOARDROOM_QUALITY_DIMENSIONS } from "../../src/lib/ai/boardroom-outcome-scoring";
import { REVERSIBILITY_MAP } from "../../src/lib/ai-platform/runtime/advisor-reversibility-map";

const now = new Date().toISOString();
const write = (path: string, data: unknown) => writeFileSync(path, JSON.stringify(data, null, 2));

mkdirSync("generated/ai-fallback-replay-bundle", { recursive: true });

// 1. ai-capability-proof-matrix.json
write("generated/ai-capability-proof-matrix.json", {
  generatedAt: now,
  totalCapabilities: AI_CAPABILITY_REGISTRY.length,
  capabilities: AI_CAPABILITY_REGISTRY.map((c) => ({
    capabilityId: c.capabilityId, owner: c.owner, allowedModels: c.allowedModels.length,
    hasFallbackChain: c.fallbackChain.length > 0, refusalConditions: c.refusalConditions.length,
    evidenceGradeRequired: c.evidenceGradeRequired, receiptRequired: c.receiptRequired,
    actionBoundarySensitivity: c.actionBoundarySensitivity,
  })),
  coverageSummary: {
    withFallbacks: AI_CAPABILITY_REGISTRY.filter((c) => c.fallbackChain.length > 0).length,
    withRefusals: AI_CAPABILITY_REGISTRY.filter((c) => c.refusalConditions.length > 0).length,
    withReceipts: AI_CAPABILITY_REGISTRY.filter((c) => c.receiptRequired).length,
    critical: AI_CAPABILITY_REGISTRY.filter((c) => c.actionBoundarySensitivity === "critical").length,
  },
});

// 2. ai-refusal-proof.json
write("generated/ai-refusal-proof.json", {
  generatedAt: now, totalTriggerCategories: REFUSAL_POLICIES.length,
  policies: REFUSAL_POLICIES, capabilityRefusalCoverage: AI_CAPABILITY_REGISTRY.map((c) => ({
    capabilityId: c.capabilityId, refusalConditions: c.refusalConditions,
  })),
});

// 3. ai-evidence-grade-coverage.json
write("generated/ai-evidence-grade-coverage.json", {
  generatedAt: now, totalSurfaces: AI_SURFACE_EVIDENCE_POLICIES.length,
  surfaces: AI_SURFACE_EVIDENCE_POLICIES,
  capabilityGrades: AI_CAPABILITY_REGISTRY.map((c) => ({ capabilityId: c.capabilityId, requiredGrade: c.evidenceGradeRequired })),
});

// 4. ai-routing-replay-report.json
write("generated/ai-routing-replay-report.json", {
  generatedAt: now, replayFamilies: ROUTING_REPLAY_FAMILIES,
  replayableCapabilities: REPLAY_FAMILIES,
  coveragePct: Math.round((ROUTING_REPLAY_FAMILIES.filter((f) => f.supportsFullReplay).length / ROUTING_REPLAY_FAMILIES.length) * 100),
});

// 5. ai-receipt-reconstruction-audit.json
write("generated/ai-receipt-reconstruction-audit.json", {
  generatedAt: now, entries: RECEIPT_RECONSTRUCTION_MAP,
  deterministicCount: RECEIPT_RECONSTRUCTION_MAP.filter((e) => e.supportsDeterministicReconstruction).length,
  totalCount: RECEIPT_RECONSTRUCTION_MAP.length,
});

// 6. ai-cost-anomaly-report.json
write("generated/ai-cost-anomaly-report.json", {
  generatedAt: now, totalRules: AI_COST_ANOMALY_RULES.length, rules: AI_COST_ANOMALY_RULES,
  criticalRules: AI_COST_ANOMALY_RULES.filter((r) => r.alertSeverity === "critical").length,
});

// 7. ai-autonomy-ceiling-proof.json
write("generated/ai-autonomy-ceiling-proof.json", {
  generatedAt: now, totalEntries: AUTONOMY_CEILING_MAP.length,
  entries: AUTONOMY_CEILING_MAP.map((e) => ({ agentId: e.agentId, agentType: e.agentType, maxTier: e.maxAutonomyTier, blockedActions: e.blockedActions.length })),
});

// 8. ai-cross-domain-restriction-proof.json
write("generated/ai-cross-domain-restriction-proof.json", {
  generatedAt: now, totalAdvisors: CROSS_DOMAIN_RESTRICTIONS.length,
  restrictions: CROSS_DOMAIN_RESTRICTIONS,
});

// 9. ai-memory-repair-coverage.json
write("generated/ai-memory-repair-coverage.json", {
  generatedAt: now, totalDomains: MEMORY_REPAIR_ENTRIES.length, entries: MEMORY_REPAIR_ENTRIES,
  safeRepairs: MEMORY_REPAIR_ENTRIES.filter((e) => e.rollbackSafety === "safe").length,
});

// 10. boardroom-outcome-quality-report.json
write("generated/boardroom-outcome-quality-report.json", {
  generatedAt: now, totalDimensions: BOARDROOM_QUALITY_DIMENSIONS.length,
  dimensions: BOARDROOM_QUALITY_DIMENSIONS,
  totalWeight: BOARDROOM_QUALITY_DIMENSIONS.reduce((s, d) => s + d.weight, 0),
});

// 11. prompt-drift-detection.json
write("generated/prompt-drift-detection.json", {
  generatedAt: now, totalConfigs: PROMPT_DRIFT_CONFIGS.length,
  configs: PROMPT_DRIFT_CONFIGS.map((c) => ({ capabilityId: c.capabilityId, method: c.detectionMethod, alertRequired: c.operatorAlertRequired, dimensions: c.monitoredDimensions.length })),
});

// 12. model-outage-simulation-results.json
const simResults = OUTAGE_SCENARIOS.map((s) => ({ scenarioId: s.scenarioId, results: simulateOutage(s.scenarioId) }));
write("generated/model-outage-simulation-results.json", {
  generatedAt: now, totalScenarios: OUTAGE_SCENARIOS.length, scenarios: simResults,
  gracefulHandling: simResults.flatMap((s) => s.results).filter((r) => r.handledGracefully).length,
  totalResults: simResults.flatMap((s) => s.results).length,
});

// 13. advisor-action-reversibility-report.json
write("generated/advisor-action-reversibility-report.json", {
  generatedAt: now, totalActions: REVERSIBILITY_MAP.length,
  entries: REVERSIBILITY_MAP,
  irreversibleActions: REVERSIBILITY_MAP.filter((e) => e.reversibility === "irreversible").map((e) => e.actionType),
  fullyReversible: REVERSIBILITY_MAP.filter((e) => e.reversibility === "fully-reversible").length,
});

// 14. ai-fallback-replay-bundle/replay-summary.json
write("generated/ai-fallback-replay-bundle/replay-summary.json", {
  generatedAt: now, totalPolicies: FALLBACK_POLICIES.length,
  policies: FALLBACK_POLICIES.map((p) => ({ capabilityId: p.capabilityId, primary: p.primaryRoute, chainLength: p.fallbackChain.length, replayable: p.replayable, degradedExpectation: p.degradedResultExpectation })),
  actionBoundaryTests: ACTION_BOUNDARY_TESTS.length,
});

console.log(`✅ Generated 14 AI behavioral proof artifacts at ${now}`);