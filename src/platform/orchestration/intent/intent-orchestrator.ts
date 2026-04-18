// ═══════════════════════════════════════════════════════════════
// SITA OS — Intent Orchestrator (Layer A)
// Canonical "what should happen" authority
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope, IntentLayerState } from "../shared/orchestration-envelope";
import type { OrchestrationContext } from "../shared/orchestration-context";
import type { OrchestrationDomain } from "../shared/orchestration-types";
import { IntentParsingError, IntentClassificationError } from "../shared/orchestration-errors";

// ── Intent Classification (adapted from legacy IntentOrchestratorService) ──

export type IntentClassification =
  | "query" | "action" | "navigation" | "approval"
  | "configuration" | "delegation" | "communication"
  | "financial" | "scheduling" | "creative";

const CLASSIFICATION_PATTERNS: [RegExp, IntentClassification, OrchestrationDomain][] = [
  [/\b(pay|transfer|send money|invoice|budget|expense)\b/i, "financial", "finance"],
  [/\b(approve|reject|review|sign off)\b/i, "approval", "platform"],
  [/\b(schedule|meeting|calendar|book|reserve)\b/i, "scheduling", "concierge"],
  [/\b(email|message|call|text|notify|contact)\b/i, "communication", "concierge"],
  [/\b(navigate|go to|open|show|display)\b/i, "navigation", "platform"],
  [/\b(create|build|generate|draft|compose)\b/i, "creative", "business"],
  [/\b(configure|set|enable|disable|toggle)\b/i, "configuration", "platform"],
  [/\b(delegate|assign|forward|hand off)\b/i, "delegation", "platform"],
  [/\b(revenue|sales|pipeline|client|deal)\b/i, "action", "business"],
  [/\b(what|how|why|when|where|show me|tell me)\b/i, "query", "cross-domain"],
];

export type RiskTier = "critical" | "elevated" | "standard" | "low";

function classifyIntent(raw: string): { classification: IntentClassification; domain: OrchestrationDomain } {
  for (const [pattern, classification, domain] of CLASSIFICATION_PATTERNS) {
    if (pattern.test(raw)) return { classification, domain };
  }
  return { classification: "query", domain: "cross-domain" };
}

function assessRisk(classification: IntentClassification, domain: OrchestrationDomain): RiskTier {
  if (classification === "financial") return "critical";
  if (classification === "approval" || classification === "delegation") return "elevated";
  if (domain === "finance") return "elevated";
  return "standard";
}

// ── Intent Orchestrator ──

export class CanonicalIntentOrchestrator {
  /**
   * Parse and classify an intent, populating the envelope's intentState.
   * This is the ONLY authority for "what should happen."
   * It does NOT execute side effects.
   */
  async resolveIntent(
    envelope: OrchestrationEnvelope,
    context: OrchestrationContext
  ): Promise<OrchestrationEnvelope> {
    const raw = envelope.intentRaw;
    if (!raw || raw.trim().length === 0) {
      throw new IntentParsingError("Empty intent — cannot classify");
    }

    const { classification, domain } = classifyIntent(raw);
    const riskTier = assessRisk(classification, domain);
    const resolvedDomain = envelope.domain !== "cross-domain" ? envelope.domain : domain;
    const escalationRequired = this.shouldEscalate(riskTier, context);
    const confidence = this.computeConfidence(raw, classification);

    const intentState: IntentLayerState = {
      classification,
      resolvedDomain,
      resolvedCapability: envelope.capabilityId || `${resolvedDomain}.${classification}`,
      riskTier,
      confidenceScore: confidence,
      escalationRequired,
      recommendationIds: [],
    };

    return {
      ...envelope,
      domain: resolvedDomain,
      intentState,
      currentLayer: "intent",
      status: escalationRequired ? "awaiting_approval" : "in_progress",
      updatedAt: new Date().toISOString(),
    };
  }

  private shouldEscalate(riskTier: RiskTier, context: OrchestrationContext): boolean {
    if (riskTier === "critical" && context.trust.trustScore < 0.8) return true;
    if (riskTier === "elevated" && context.permission.maxAutonomyLevel < 2) return true;
    return false;
  }

  private computeConfidence(raw: string, classification: IntentClassification): number {
    const wordCount = raw.split(/\s+/).length;
    let base = 0.6;
    if (wordCount > 3) base += 0.1;
    if (wordCount > 8) base += 0.1;
    if (classification !== "query") base += 0.05;
    return Math.min(base, 0.95);
  }
}

export const canonicalIntentOrchestrator = new CanonicalIntentOrchestrator();
