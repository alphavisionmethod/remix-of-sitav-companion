// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Context Assembler
// Builds per-advisor briefing packets from shared, domain,
// specialization, policy, memory, and evidence layers
// ═══════════════════════════════════════════════════════════════

import type {
  AdvisorBriefingPacket,
  ContextRetrievalPlan,
  ContextRetrievalStep,
  EvidenceBundle,
  EvidenceReference,
  AdvisorSpecializationContract,
} from "./types";
import { getSpecialization } from "./specializations";
import { createConfidenceEnvelope, classifyRisk } from "@/lib/no-hallucination";
import { evaluateStaleness } from "@/lib/no-hallucination";
import { createEmptyContradictionReport } from "@/lib/no-hallucination";

// ── Retrieval Plan Builder ────────────────────────────────

export function buildRetrievalPlan(advisorId: string, tokenBudget: number = 4000): ContextRetrievalPlan {
  const spec = getSpecialization(advisorId);
  if (!spec) {
    return { advisorId, steps: [], totalTokenEstimate: 0, maxParallelFetches: 3, deadlineMs: 2000 };
  }

  const steps: ContextRetrievalStep[] = [];

  // Required context — direct queries, blocking
  for (const ctx of spec.requiredContext) {
    steps.push({
      source: ctx,
      strategy: inferStrategy(ctx),
      priority: "required",
      maxLatencyMs: 500,
      fallbackBehavior: "block",
      tokenEstimate: estimateTokens(ctx),
    });
  }

  // Optional context — parallel, skippable
  for (const ctx of spec.optionalContext) {
    steps.push({
      source: ctx,
      strategy: inferStrategy(ctx),
      priority: "optional",
      maxLatencyMs: 300,
      fallbackBehavior: "skip",
      tokenEstimate: estimateTokens(ctx),
    });
  }

  // Policy envelope — always required
  steps.push({
    source: "policy_envelope",
    strategy: "policy-eval",
    priority: "required",
    maxLatencyMs: 200,
    fallbackBehavior: "use-stale",
    tokenEstimate: 200,
  });

  // Memory context — if allowed
  if (spec.memoryPolicy !== "none") {
    steps.push({
      source: "memory_context",
      strategy: "memory-lookup",
      priority: "preferred",
      maxLatencyMs: 300,
      fallbackBehavior: "skip",
      tokenEstimate: 400,
    });
  }

  // Trim to token budget
  let totalTokens = 0;
  const trimmed = steps.filter(s => {
    if (s.priority === "required") {
      totalTokens += s.tokenEstimate;
      return true;
    }
    if (totalTokens + s.tokenEstimate <= tokenBudget) {
      totalTokens += s.tokenEstimate;
      return true;
    }
    return false;
  });

  return {
    advisorId,
    steps: trimmed,
    totalTokenEstimate: totalTokens,
    maxParallelFetches: 5,
    deadlineMs: spec.trustSensitivity === "critical" ? 3000 : 2000,
  };
}

function inferStrategy(source: string): ContextRetrievalStep["strategy"] {
  if (source.includes("summary") || source.includes("trend")) return "analytics-aggregate";
  if (source.includes("policy") || source.includes("trust")) return "policy-eval";
  if (source.includes("memory") || source.includes("preferences")) return "memory-lookup";
  if (source.includes("projection") || source.includes("forecast")) return "projection-read";
  if (source.includes("graph") || source.includes("correlation")) return "graph-traversal";
  return "direct-query";
}

function estimateTokens(source: string): number {
  const estimates: Record<string, number> = {
    customers: 600, leads: 500, deals: 400, invoices: 400,
    pipeline_summary: 300, cash_flow: 400, bills: 300,
    subscriptions: 200, reserves: 200, account_balances: 200,
    calendar: 300, tasks: 300, routines: 200,
    communications_log: 500, market_data: 400,
  };
  return estimates[source] || 300;
}

// ── Evidence Bundle Builder ───────────────────────────────

export function buildEvidenceBundle(references: EvidenceReference[]): EvidenceBundle {
  const now = Date.now();
  const freshnesses = references.map(r => ({ ...r, ageMs: now - new Date(r.freshness).getTime() }));

  const sortedByAge = [...freshnesses].sort((a, b) => a.ageMs - b.ageMs);
  const freshestAt = sortedByAge[0]?.freshness || new Date().toISOString();
  const stalestAt = sortedByAge[sortedByAge.length - 1]?.freshness || new Date().toISOString();

  const maxAgeMs = sortedByAge[sortedByAge.length - 1]?.ageMs || 0;
  const overallFreshness =
    maxAgeMs < 300000 ? "fresh" :
    maxAgeMs < 3600000 ? "aging" :
    maxAgeMs < 86400000 ? "stale" : "critical";

  // Detect gaps — sources with low confidence or missing
  const gapsDetected = references.filter(r => r.confidence < 0.5).map(r => `Low confidence: ${r.sourceName}`);

  // Detect contradictions — same domain, different values
  const contradictionsDetected: string[] = [];
  const byDomain = new Map<string, EvidenceReference[]>();
  for (const ref of references) {
    const existing = byDomain.get(ref.domain) || [];
    existing.push(ref);
    byDomain.set(ref.domain, existing);
  }

  return {
    references,
    totalSources: references.length,
    freshestAt,
    stalestAt,
    overallFreshness,
    gapsDetected,
    contradictionsDetected,
  };
}

// ── Briefing Packet Assembler ─────────────────────────────

export function assembleBriefingPacket(
  advisorId: string,
  sessionId: string,
  contextData: {
    shared?: Record<string, unknown>;
    domain?: Record<string, unknown>;
    specialization?: Record<string, unknown>;
    memories?: { key: string; value: string; confidence: number; age: string }[];
    corrections?: { original: string; corrected: string; correctedAt: string }[];
    preferences?: Record<string, string>;
    evidence?: EvidenceReference[];
    simulations?: { scenarioId: string; outcome: string; confidence: number; risks: string[] }[];
  },
  tokenBudget: number = 4000,
): AdvisorBriefingPacket {
  const spec = getSpecialization(advisorId);
  const evidence = buildEvidenceBundle(contextData.evidence || []);
  const plan = buildRetrievalPlan(advisorId, tokenBudget);

  // Compute unresolvedGaps from spec required context vs what's present
  const presentKeys = new Set([
    ...Object.keys(contextData.shared || {}),
    ...Object.keys(contextData.domain || {}),
    ...Object.keys(contextData.specialization || {}),
  ]);
  const unresolvedGaps = (spec?.requiredContext || []).filter(k => !presentKeys.has(k));

  // Build confidence
  const staleness = evaluateStaleness(
    (contextData.evidence || []).map(e => ({
      id: e.sourceId,
      name: e.sourceName,
      domain: e.domain,
      lastUpdated: e.freshness,
    }))
  );

  const contextConfidence = createConfidenceEnvelope({
    baseScore: evidence.overallFreshness === "fresh" ? 0.9 : evidence.overallFreshness === "aging" ? 0.7 : 0.5,
    riskClass: classifyRisk(spec?.domain || "general", "recommendation"),
    missingInputs: unresolvedGaps,
    staleness,
    contradictions: createEmptyContradictionReport(),
    totalExpectedFields: spec?.requiredContext.length || 0,
    totalPresentFields: (spec?.requiredContext || []).filter(k => presentKeys.has(k)).length,
  });

  return {
    advisorId,
    sessionId,
    assembledAt: new Date().toISOString(),
    tokenBudget,
    tokenUsed: plan.totalTokenEstimate,
    sharedContext: contextData.shared || {},
    domainContext: contextData.domain || {},
    specializationContext: contextData.specialization || {},
    policyEnvelope: {
      activeRules: [],
      constraints: [],
      approvalRequired: spec?.trustSensitivity === "critical" || spec?.trustSensitivity === "veto-capable",
      trustLevel: spec?.trustSensitivity || "standard",
    },
    memoryContext: {
      relevantMemories: contextData.memories || [],
      preferences: contextData.preferences || {},
      corrections: contextData.corrections || [],
    },
    evidence,
    simulationResults: contextData.simulations || [],
    unresolvedGaps,
    contextConfidence,
  };
}
