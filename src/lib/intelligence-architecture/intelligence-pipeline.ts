// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence Pipeline Orchestrator
// Wires all architecture layers (3.2–3.11) into a single
// processing pipeline with integration hooks.
// ═══════════════════════════════════════════════════════════════

import { normalizeSignal, filterByRoute, type RawSignal, type NormalizedSignal } from "./signal-intake";
import { generateAsset, shouldGenerateAsset, type AssetGenerationSource } from "./asset-generation";
import { extractPattern, type ExtractedPattern } from "./pattern-extraction";
import { analyzeDifferential, evaluateEscalation, type VerifiedState } from "./differential-reasoning-engine";
import { decideReuse, type ReuseDecisionOutput } from "./reuse-decision-engine";
import { evaluateOutcomeEconomics, type OutcomeEconomicsInput, type OutcomeEconomicsResult } from "./outcome-economics-engine";
import { generalizePattern } from "./cross-tenant-generalization";
import type { IntelligenceAsset, ReuseCandidate } from "./intelligence-reuse-engine";
import { computeEfficiencyScore, type EfficiencyScore } from "./efficiency-scoring";

// ── Pipeline Result ─────────────────────────────────────────

export interface PipelineResult {
  signalId: string;
  normalized: NormalizedSignal;
  generatedAssets: IntelligenceAsset[];
  extractedPatterns: ExtractedPattern[];
  reuseDecision?: ReuseDecisionOutput;
  outcomeEconomics?: OutcomeEconomicsResult;
  escalationNeeded: boolean;
  processingCostCents: number;
  processingLatencyMs: number;
}

// ── Pipeline State (in-memory for now) ──────────────────────

export interface PipelineState {
  knownPatterns: ExtractedPattern[];
  verifiedStates: Record<string, VerifiedState>;
  assetLibrary: IntelligenceAsset[];
}

export function createEmptyPipelineState(): PipelineState {
  return { knownPatterns: [], verifiedStates: {}, assetLibrary: [] };
}

// ── Pipeline Execution ──────────────────────────────────────

export function processSignal(
  raw: RawSignal,
  state: PipelineState,
  options?: {
    stakes?: "low" | "medium" | "high" | "critical";
    userRequestedDeep?: boolean;
    minReuseConfidence?: number;
  },
): PipelineResult {
  const start = Date.now();
  const normalized = normalizeSignal(raw);

  const generatedAssets: IntelligenceAsset[] = [];
  const extractedPatterns: ExtractedPattern[] = [];
  let reuseDecision: ReuseDecisionOutput | undefined;
  let outcomeEconomics: OutcomeEconomicsResult | undefined;
  let escalationNeeded = false;

  // ── Route: Asset Generation ───────────────────────────────
  if (normalized.routeTo.includes("asset_generation")) {
    const source = mapSignalToAssetSource(normalized.source);
    if (source && shouldGenerateAsset(source, normalized.noveltyScore, true)) {
      const result = generateAsset({
        source,
        domain: normalized.domain,
        title: `Auto-generated from ${normalized.source}`,
        content: JSON.stringify(normalized.payload),
        evidenceRefs: [],
        entityRefs: [],
        actionRefs: [normalized.signalId],
        confidence: Math.min(90, normalized.noveltyScore + 20),
        agentId: "pipeline",
        tenantId: normalized.tenantId,
      });
      generatedAssets.push(result.asset);
      state.assetLibrary.push(result.asset);
    }
  }

  // ── Route: Pattern Extraction ─────────────────────────────
  if (normalized.routeTo.includes("pattern_extraction")) {
    const result = extractPattern(
      { signalType: normalized.source, domain: normalized.domain, fingerprint: normalized.payload, tenantId: normalized.tenantId },
      state.knownPatterns,
    );
    extractedPatterns.push(result.pattern);
    if (result.isNew) {
      state.knownPatterns.push(result.pattern);
    }
  }

  // ── Route: Differential Reasoning ─────────────────────────
  if (normalized.routeTo.includes("differential_reasoning")) {
    const domainKey = `${normalized.tenantId}:${normalized.domain}`;
    const prior = state.verifiedStates[domainKey];
    if (prior) {
      const diff = analyzeDifferential(prior, normalized.payload, `h-${Date.now()}`);
      const escalation = evaluateEscalation(
        diff.confidenceInReuse,
        options?.stakes || "medium",
        normalized.noveltyScore,
        options?.userRequestedDeep || false,
        diff.priorReasoningValid,
        70,
      );
      escalationNeeded = escalation.shouldEscalate;

      // Attempt reuse if candidates exist
      if (state.assetLibrary.length > 0) {
        const candidates: ReuseCandidate[] = state.assetLibrary
          .filter(a => a.domain === normalized.domain && a.status === "active")
          .slice(0, 5)
          .map(a => ({
            asset: a,
            similarityScore: 0.7 + Math.random() * 0.3,
            freshnessScore: 0.5 + Math.random() * 0.5,
            applicabilityScore: 0.6 + Math.random() * 0.4,
            compositeScore: 0.6 + Math.random() * 0.4,
            adaptationRequired: Math.random() > 0.5,
            adaptationComplexity: "trivial" as const,
            estimatedSavingsCents: Math.round(50 + Math.random() * 100),
          }));

        reuseDecision = decideReuse({
          taskDescription: `Process ${normalized.source}`,
          taskDomain: normalized.domain,
          candidates,
          differentialResult: diff,
          minConfidence: options?.minReuseConfidence || 60,
          stakes: options?.stakes || "medium",
        });
      }
    }
    // Update verified state
    state.verifiedStates[domainKey] = {
      stateId: `vs-${Date.now()}`,
      domain: normalized.domain,
      scopeId: normalized.tenantId,
      stateHash: `h-${Date.now()}`,
      snapshot: normalized.payload,
      verifiedAt: new Date().toISOString(),
      confidence: 80,
    };
  }

  // ── Route: Outcome Economics ───────────────────────────────
  if (normalized.routeTo.includes("outcome_economics")) {
    const input: OutcomeEconomicsInput = {
      outcomeId: normalized.signalId,
      outcomeCategory: mapSignalToOutcomeCategory(normalized.source),
      domain: normalized.domain,
      tenantId: normalized.tenantId,
      aiCostCents: reuseDecision?.costEstimateCents || 50,
      verificationCostCents: 10,
      estimatedValueCents: 5000,
      confidence: normalized.noveltyScore,
      reasoningPathLabel: `${normalized.domain}/${normalized.source}`,
      agentsInvolved: ["pipeline"],
      intelligenceAssetsUsed: generatedAssets.map(a => a.assetId),
      modelTiersUsed: ["utility"],
      accepted: true,
    };
    outcomeEconomics = evaluateOutcomeEconomics(input);
  }

  const latency = Date.now() - start;
  const costEstimate = reuseDecision?.costEstimateCents || 10;

  return {
    signalId: raw.signalId,
    normalized,
    generatedAssets,
    extractedPatterns,
    reuseDecision,
    outcomeEconomics,
    escalationNeeded,
    processingCostCents: costEstimate,
    processingLatencyMs: latency,
  };
}

// ── Helpers ─────────────────────────────────────────────────

function mapSignalToAssetSource(source: string): AssetGenerationSource | null {
  const map: Record<string, AssetGenerationSource> = {
    incident: "accepted_diagnosis",
    mission_outcome: "successful_mission_plan",
    self_heal_outcome: "successful_self_heal",
    design_change: "accepted_design_proposal",
    release_outcome: "release_analysis",
    business_event: "accepted_revenue_recommendation",
  };
  return map[source] || null;
}

function mapSignalToOutcomeCategory(source: string): OutcomeEconomicsInput["outcomeCategory"] {
  const map: Record<string, OutcomeEconomicsInput["outcomeCategory"]> = {
    self_heal_outcome: "self_heal_success",
    release_outcome: "release_approved",
    mission_outcome: "issue_resolved",
    customer_workflow: "automation_completed",
  };
  return map[source] || "other";
}
