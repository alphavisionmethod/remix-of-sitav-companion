// ═══════════════════════════════════════════════════════════════
// SITA OS — Testing Strategy Framework
// Layered testing model with coverage targets per domain
// ═══════════════════════════════════════════════════════════════

export type TestTier =
  | "unit"
  | "integration"
  | "edge-function"
  | "workflow"
  | "e2e"
  | "regression"
  | "safety-permission";

export interface TestTierDefinition {
  tier: TestTier;
  description: string;
  coverageTarget: number; // percentage
  runFrequency: "every-commit" | "pr-merge" | "nightly" | "weekly";
  tools: string[];
  blocksMerge: boolean;
}

export const TEST_TIERS: readonly TestTierDefinition[] = [
  {
    tier: "unit",
    description: "Isolated logic: pure functions, utilities, transformers, validators",
    coverageTarget: 80,
    runFrequency: "every-commit",
    tools: ["vitest"],
    blocksMerge: true,
  },
  {
    tier: "integration",
    description: "Cross-service interactions: service → DB, service → service contracts",
    coverageTarget: 60,
    runFrequency: "pr-merge",
    tools: ["vitest", "supabase-test-helpers"],
    blocksMerge: true,
  },
  {
    tier: "edge-function",
    description: "Edge function request/response contract validation",
    coverageTarget: 90,
    runFrequency: "pr-merge",
    tools: ["deno-test", "vitest"],
    blocksMerge: true,
  },
  {
    tier: "workflow",
    description: "Multi-step business workflows: intake → process → output → receipt",
    coverageTarget: 70,
    runFrequency: "pr-merge",
    tools: ["vitest"],
    blocksMerge: true,
  },
  {
    tier: "e2e",
    description: "Full user journeys through the UI: click → navigate → assert",
    coverageTarget: 50,
    runFrequency: "nightly",
    tools: ["playwright"],
    blocksMerge: false,
  },
  {
    tier: "regression",
    description: "Previously broken flows verified against recurrence",
    coverageTarget: 100,
    runFrequency: "every-commit",
    tools: ["vitest"],
    blocksMerge: true,
  },
  {
    tier: "safety-permission",
    description: "RLS policies, role gates, kill-switch enforcement, consent boundaries",
    coverageTarget: 95,
    runFrequency: "pr-merge",
    tools: ["vitest", "supabase-test-helpers"],
    blocksMerge: true,
  },
] as const;

export type DomainCoverageTarget = {
  domain: string;
  requiredTiers: TestTier[];
  minimumCoverage: number;
  criticalPaths: string[];
  owner: string;
};

export const DOMAIN_COVERAGE_TARGETS: readonly DomainCoverageTarget[] = [
  {
    domain: "identity-auth",
    requiredTiers: ["unit", "integration", "safety-permission", "e2e"],
    minimumCoverage: 90,
    criticalPaths: ["signup", "login", "oauth", "session-refresh", "role-gate"],
    owner: "platform",
  },
  {
    domain: "investor-dealroom",
    requiredTiers: ["unit", "integration", "workflow", "safety-permission"],
    minimumCoverage: 85,
    criticalPaths: ["request-access", "deal-room-view", "document-download", "gated-access"],
    owner: "growth",
  },
  {
    domain: "advisory-boardroom",
    requiredTiers: ["unit", "integration", "edge-function", "workflow"],
    minimumCoverage: 80,
    criticalPaths: ["session-create", "advisor-invoke", "consensus-build", "recommendation-emit"],
    owner: "intelligence",
  },
  {
    domain: "ai-orchestration",
    requiredTiers: ["unit", "integration", "edge-function", "safety-permission"],
    minimumCoverage: 90,
    criticalPaths: ["model-route", "budget-enforce", "fallback-trigger", "receipt-emit", "ledger-write"],
    owner: "intelligence",
  },
  {
    domain: "workflow-engine",
    requiredTiers: ["unit", "integration", "workflow"],
    minimumCoverage: 80,
    criticalPaths: ["trigger-fire", "step-execute", "error-handle", "receipt-create"],
    owner: "platform",
  },
  {
    domain: "crowdfund-donor",
    requiredTiers: ["unit", "integration", "workflow", "safety-permission"],
    minimumCoverage: 85,
    criticalPaths: ["pledge-create", "payment-process", "receipt-emit", "refund-handle"],
    owner: "growth",
  },
  {
    domain: "waitlist-beta",
    requiredTiers: ["unit", "integration", "e2e"],
    minimumCoverage: 75,
    criticalPaths: ["submit", "confirm-email", "invite-send", "beta-activate"],
    owner: "growth",
  },
  {
    domain: "trust-audit",
    requiredTiers: ["unit", "integration", "safety-permission"],
    minimumCoverage: 95,
    criticalPaths: ["receipt-create", "consent-enforce", "audit-log-write", "kill-switch-trigger"],
    owner: "platform",
  },
  {
    domain: "crm-contacts",
    requiredTiers: ["unit", "integration"],
    minimumCoverage: 70,
    criticalPaths: ["contact-create", "contact-link", "activity-log"],
    owner: "product",
  },
  {
    domain: "campaigns-messaging",
    requiredTiers: ["unit", "integration", "workflow"],
    minimumCoverage: 75,
    criticalPaths: ["campaign-send", "suppression-check", "bounce-handle"],
    owner: "growth",
  },
] as const;

export function getTestTier(tier: TestTier): TestTierDefinition | undefined {
  return TEST_TIERS.find((t) => t.tier === tier);
}

export function getDomainTarget(domain: string): DomainCoverageTarget | undefined {
  return DOMAIN_COVERAGE_TARGETS.find((d) => d.domain === domain);
}