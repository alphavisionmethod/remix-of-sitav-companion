// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Domain Model Clarification
// Canonical definitions: Advisor, Boardroom, Brain
// ═══════════════════════════════════════════════════════════════

export interface AIDomainConcept {
  name: string;
  purpose: string;
  userFacingMeaning: string;
  internalMeaning: string;
  ownsLogicFor: string[];
  doesNotOwn: string[];
  relationships: string[];
  canonicalServices: string[];
  canonicalRoutes: string[];
}

export const AI_DOMAIN_MODEL: Record<"advisor" | "boardroom" | "brain", AIDomainConcept> = {
  advisor: {
    name: "Advisor",
    purpose: "Specialized guidance persona bound to a single domain",
    userFacingMeaning: "Your dedicated expert for a specific area (Business, Finance, Legal, etc.) that understands your context and gives personalized recommendations",
    internalMeaning: "A registered agent with domain-scoped knowledge, prompt family, and autonomy policies. Produces recommendations, consumes domain signals, and participates in boardroom sessions when invited",
    ownsLogicFor: [
      "Domain-specific recommendation generation",
      "Single-domain intelligence and analysis",
      "User-facing guidance interactions (1:1 chat)",
      "Domain signal consumption and pattern recognition",
      "Knowledge accumulation within domain scope",
    ],
    doesNotOwn: [
      "Multi-advisor debate or consensus",
      "Model routing or inference pipeline",
      "Memory persistence infrastructure",
      "Budget enforcement",
      "Cross-domain orchestration",
    ],
    relationships: [
      "Participates in Boardroom sessions as a contributor",
      "Uses Brain for memory retrieval and model inference",
      "Emits recommendations that flow through Boardroom for strategic review",
    ],
    canonicalServices: ["advisor-service", "recommendation-service"],
    canonicalRoutes: ["/advisor/:domain", "/advisor/:domain/chat"],
  },
  boardroom: {
    name: "Boardroom",
    purpose: "Structured multi-advisor consultation and strategic review surface",
    userFacingMeaning: "A strategic council where multiple advisors debate, analyze, and reach consensus on important decisions — like having a board meeting for your business",
    internalMeaning: "An orchestration surface that convenes multiple advisors, structures debate rounds, synthesizes perspectives, identifies consensus/disagreement, and produces board-level recommendations with evidence and confidence scoring",
    ownsLogicFor: [
      "Multi-advisor session orchestration",
      "Debate structuring and round management",
      "Consensus detection and disagreement surfacing",
      "Strategic recommendation synthesis",
      "Follow-through dispatch and outcome tracking",
      "SLA enforcement on boardroom items",
    ],
    doesNotOwn: [
      "Individual advisor domain expertise",
      "Model routing or inference pipeline",
      "Memory persistence infrastructure",
      "Budget enforcement",
      "Single-domain analysis",
    ],
    relationships: [
      "Invokes Advisors as participants in sessions",
      "Uses Brain for shared context and memory",
      "Produces board-level recommendations that flow to follow-through",
    ],
    canonicalServices: ["boardroom-service"],
    canonicalRoutes: ["/boardroom", "/boardroom/session/:id"],
  },
  brain: {
    name: "Brain",
    purpose: "Underlying orchestration, memory, and reasoning substrate",
    userFacingMeaning: "The intelligence infrastructure that powers all AI features — remembers context, routes to the right models, and ensures quality and budget compliance",
    internalMeaning: "The shared intelligence layer providing: context retrieval from memory stores, model routing via capability registry, inference pipeline management, budget enforcement, receipt emission, fallback chain execution, and prompt version management. Not user-facing; consumed by Advisors and Boardroom",
    ownsLogicFor: [
      "Model routing and capability registration",
      "Inference pipeline (request → model → response)",
      "Memory persistence and retrieval",
      "Budget enforcement and cost tracking",
      "Fallback chain execution",
      "Receipt and ledger emission",
      "Prompt version management",
      "Provider health monitoring",
    ],
    doesNotOwn: [
      "Domain-specific analysis or recommendations",
      "Multi-advisor debate orchestration",
      "User-facing chat UX",
      "Strategic decision-making",
    ],
    relationships: [
      "Serves Advisors with inference, memory, and budget gates",
      "Serves Boardroom with shared context and model routing",
      "Emits receipts to Trust/Audit layer",
    ],
    canonicalServices: ["model-router-service", "budget-service", "inference-service", "prompt-service", "fallback-service"],
    canonicalRoutes: [], // Brain has no user-facing routes
  },
} as const;

/**
 * Decision tree for engineers:
 * - Single-role guidance experience? → Advisor
 * - Structured multi-perspective strategic consultation? → Boardroom
 * - Shared intelligence infrastructure (memory, routing, budget)? → Brain
 */
export function classifyAIConcern(
  isSingleDomain: boolean,
  isMultiAdvisor: boolean,
  isInfrastructure: boolean
): "advisor" | "boardroom" | "brain" {
  if (isInfrastructure) return "brain";
  if (isMultiAdvisor) return "boardroom";
  if (isSingleDomain) return "advisor";
  return "brain"; // default to infrastructure
}