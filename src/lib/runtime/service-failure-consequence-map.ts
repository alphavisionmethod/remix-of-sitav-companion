// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Failure Consequence Map
// Maps service failure to user-facing impact
// ═══════════════════════════════════════════════════════════════

export type FailureSeverity = "critical" | "major" | "minor" | "cosmetic";
export type UserImpact = "full-outage" | "degraded-experience" | "feature-unavailable" | "no-impact";

export interface ServiceFailureConsequence {
  serviceId: string;
  failureSeverity: FailureSeverity;
  userImpact: UserImpact;
  /** User-facing message when this service fails */
  userMessage: string;
  /** Which features become unavailable */
  affectedFeatures: string[];
  /** Whether the system can continue without this service */
  canContinueWithout: boolean;
  /** Recommended recovery action */
  recommendedAction: "auto-restart" | "manual-intervention" | "graceful-degrade" | "escalate-to-admin";
  /** Estimated recovery time */
  estimatedRecoveryMs: number;
}

export const SERVICE_FAILURE_CONSEQUENCES: ServiceFailureConsequence[] = [
  { serviceId: "event-bus", failureSeverity: "critical", userImpact: "full-outage", userMessage: "System communication is temporarily unavailable", affectedFeatures: ["all"], canContinueWithout: false, recommendedAction: "auto-restart", estimatedRecoveryMs: 5_000 },
  { serviceId: "memory-service", failureSeverity: "critical", userImpact: "degraded-experience", userMessage: "Your preferences may not be loaded", affectedFeatures: ["personalization", "context"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 10_000 },
  { serviceId: "policy-engine", failureSeverity: "critical", userImpact: "degraded-experience", userMessage: "Some actions may require manual approval", affectedFeatures: ["automation", "approval"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 15_000 },
  { serviceId: "trust-state-service", failureSeverity: "major", userImpact: "degraded-experience", userMessage: "Trust verification is temporarily limited", affectedFeatures: ["trust-scoring", "approval-bypass"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 10_000 },
  { serviceId: "receipt-service", failureSeverity: "major", userImpact: "feature-unavailable", userMessage: "Proof receipts will be generated when the service recovers", affectedFeatures: ["proof-emission", "audit-trail"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 10_000 },
  { serviceId: "workflow-engine", failureSeverity: "major", userImpact: "feature-unavailable", userMessage: "Automated workflows are paused", affectedFeatures: ["workflows", "automation"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 20_000 },
  { serviceId: "executor-service", failureSeverity: "critical", userImpact: "degraded-experience", userMessage: "Action execution is temporarily limited", affectedFeatures: ["execution", "side-effects"], canContinueWithout: true, recommendedAction: "escalate-to-admin", estimatedRecoveryMs: 30_000 },
  { serviceId: "search-fabric", failureSeverity: "minor", userImpact: "feature-unavailable", userMessage: "Search is temporarily unavailable", affectedFeatures: ["search"], canContinueWithout: true, recommendedAction: "graceful-degrade", estimatedRecoveryMs: 15_000 },
  { serviceId: "fraud-sentinel", failureSeverity: "minor", userImpact: "no-impact", userMessage: "", affectedFeatures: ["fraud-detection"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 10_000 },
  { serviceId: "projection-service", failureSeverity: "minor", userImpact: "feature-unavailable", userMessage: "Financial projections are temporarily unavailable", affectedFeatures: ["projections"], canContinueWithout: true, recommendedAction: "graceful-degrade", estimatedRecoveryMs: 15_000 },
  { serviceId: "connector-control", failureSeverity: "minor", userImpact: "feature-unavailable", userMessage: "External integrations are reconnecting", affectedFeatures: ["connectors", "integrations"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 30_000 },
  { serviceId: "file-ingestion", failureSeverity: "minor", userImpact: "feature-unavailable", userMessage: "Document processing is temporarily paused", affectedFeatures: ["file-upload", "document-ai"], canContinueWithout: true, recommendedAction: "graceful-degrade", estimatedRecoveryMs: 20_000 },
  { serviceId: "brain-core", failureSeverity: "major", userImpact: "degraded-experience", userMessage: "AI capabilities are limited", affectedFeatures: ["ai-inference", "recommendations", "advisor"], canContinueWithout: true, recommendedAction: "auto-restart", estimatedRecoveryMs: 30_000 },
];

export function getFailureConsequence(serviceId: string): ServiceFailureConsequence | undefined {
  return SERVICE_FAILURE_CONSEQUENCES.find((c) => c.serviceId === serviceId);
}

export function getCriticalFailures(): ServiceFailureConsequence[] {
  return SERVICE_FAILURE_CONSEQUENCES.filter((c) => c.failureSeverity === "critical");
}
