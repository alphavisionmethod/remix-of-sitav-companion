// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Concept Decision Tree (Workstream C)
// Programmatic framework for classifying AI features into
// Advisor, Boardroom, or Brain domains
// ═══════════════════════════════════════════════════════════════

export type AIConceptDomain = "advisor" | "boardroom" | "brain";

export interface ClassificationInput {
  /** Does this feature serve a single domain perspective? */
  isSingleDomainPerspective: boolean;
  /** Does this feature orchestrate multiple advisors? */
  isMultiAdvisorOrchestration: boolean;
  /** Is this shared intelligence infrastructure? */
  isSharedInfrastructure: boolean;
  /** Does this have a direct user-facing surface? */
  isUserFacing: boolean;
  /** Is this about memory, routing, or budget? */
  isMemoryRoutingOrBudget: boolean;
  /** Is this about strategic multi-perspective review? */
  isStrategicReview: boolean;
}

export interface ClassificationResult {
  domain: AIConceptDomain;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  canonicalHome: string;
  antiPatterns: string[];
}

/**
 * Classify an AI feature into the correct domain.
 * Use this before creating new files, services, or components.
 */
export function classifyAIFeature(input: ClassificationInput): ClassificationResult {
  // Rule 1: Infrastructure → Brain (highest priority)
  if (input.isSharedInfrastructure || input.isMemoryRoutingOrBudget) {
    return {
      domain: "brain",
      confidence: input.isMemoryRoutingOrBudget ? "high" : "medium",
      reasoning: "Shared intelligence infrastructure belongs in Brain substrate",
      canonicalHome: "src/lib/core-services/brain-core/",
      antiPatterns: [
        "Do NOT put in src/lib/advisors/ — Brain is not advisor-specific",
        "Do NOT create a user-facing route — Brain has no direct UX",
        "Do NOT put in src/lib/boardroom/ — Brain serves all domains",
      ],
    };
  }

  // Rule 2: Multi-advisor orchestration → Boardroom
  if (input.isMultiAdvisorOrchestration || input.isStrategicReview) {
    return {
      domain: "boardroom",
      confidence: "high",
      reasoning: "Multi-advisor orchestration and strategic review belong in Boardroom",
      canonicalHome: "src/lib/boardroom/",
      antiPatterns: [
        "Do NOT put in src/lib/advisors/ — Boardroom is multi-advisor, not single",
        "Do NOT put in brain-core/ — Boardroom is a product surface, not substrate",
        "Do NOT name it 'advisor-board' — use 'boardroom' terminology",
      ],
    };
  }

  // Rule 3: Single-domain perspective → Advisor
  if (input.isSingleDomainPerspective) {
    return {
      domain: "advisor",
      confidence: input.isUserFacing ? "high" : "medium",
      reasoning: "Single-domain guidance perspective belongs in Advisor",
      canonicalHome: "src/lib/advisors/",
      antiPatterns: [
        "Do NOT put in src/lib/boardroom/ — Advisor is single-perspective",
        "Do NOT put in brain-core/ — Advisor uses Brain, is not Brain",
        "Do NOT duplicate in src/lib/services/advisor-*/ — use canonical home",
      ],
    };
  }

  // Default: Brain (infrastructure fallback)
  return {
    domain: "brain",
    confidence: "low",
    reasoning: "Could not clearly classify — defaulting to Brain (infrastructure). Review classification manually.",
    canonicalHome: "src/lib/core-services/brain-core/",
    antiPatterns: [
      "Review whether this is truly infrastructure or a product surface",
      "If user-facing, it likely belongs in Advisor or Boardroom",
    ],
  };
}

// ── Quick-reference examples ──

export const CLASSIFICATION_EXAMPLES = {
  advisor: [
    "Finance-specific recommendation generation",
    "Business advisor 1:1 chat interaction",
    "Domain-specific knowledge retrieval",
    "Single-advisor feedback collection",
    "Advisor personality configuration",
  ],
  boardroom: [
    "Multi-advisor debate session orchestration",
    "Strategic recommendation synthesis",
    "Consensus detection across advisors",
    "Follow-through dispatch and outcome tracking",
    "Board meeting UX and session management",
  ],
  brain: [
    "Model routing and capability registration",
    "Inference pipeline (request → model → response)",
    "Memory persistence and retrieval infrastructure",
    "Budget enforcement and cost tracking",
    "Prompt version management",
    "Provider health monitoring",
    "Fallback chain execution",
  ],
} as const;