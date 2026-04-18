// ═══════════════════════════════════════════════════════════════
// SITA OS — Decision Router (Intent Layer)
// Routes parsed intents to correct domain
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationEnvelope } from "../shared/orchestration-envelope";
import type { OrchestrationDomain } from "../shared/orchestration-types";

export interface RoutingDecision {
  targetDomain: OrchestrationDomain;
  targetCapability: string;
  confidence: number;
  alternativeDomains: OrchestrationDomain[];
}

export function routeDecision(envelope: OrchestrationEnvelope): RoutingDecision {
  const intentState = envelope.intentState;
  if (!intentState) {
    return {
      targetDomain: envelope.domain,
      targetCapability: envelope.capabilityId,
      confidence: 0.3,
      alternativeDomains: [],
    };
  }

  return {
    targetDomain: intentState.resolvedDomain,
    targetCapability: intentState.resolvedCapability,
    confidence: intentState.confidenceScore,
    alternativeDomains: computeAlternatives(intentState.resolvedDomain, intentState.classification),
  };
}

function computeAlternatives(primary: OrchestrationDomain, classification: string): OrchestrationDomain[] {
  const alts: OrchestrationDomain[] = [];
  if (primary !== "platform" && (classification === "configuration" || classification === "navigation")) {
    alts.push("platform");
  }
  if (primary !== "business" && classification === "action") {
    alts.push("business");
  }
  return alts;
}
