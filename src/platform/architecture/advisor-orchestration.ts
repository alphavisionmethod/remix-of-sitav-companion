// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Orchestration System
// Rule 17: Advisors advise. Only sovereign control authorizes.
// ═══════════════════════════════════════════════════════════════

export interface AdvisorDeclaration {
  advisorId: string;
  name: string;
  domain: "finance-os" | "business-os" | "concierge-os" | "platform" | "cross-domain";
  scope: string[];                  // what topics it can address
  allowedInputs: string[];
  prohibitedOutputs: string[];      // things it must never produce
  requiredEvidenceLevels: ("claimed" | "inferred" | "observed" | "attested" | "verified")[];
  canRecommend: boolean;            // can suggest actions
  canOnlyAnalyze: boolean;          // analysis only, no recommendations
  approvalAlwaysRequired: boolean;  // every recommendation needs approval
  confidenceThreshold: number;      // below this, must escalate
  maxTokensPerRequest: number;
  costTier: "economy" | "standard" | "premium";
}

export interface CouncilSession {
  sessionId: string;
  topic: string;
  tenantId: string;
  participants: AdvisorParticipation[];
  quorumRequired: number;
  quorumMet: boolean;
  synthesisOutput?: CouncilSynthesis;
  status: "convening" | "deliberating" | "synthesizing" | "concluded" | "escalated";
  createdAt: string;
  concludedAt?: string;
}

export interface AdvisorParticipation {
  advisorId: string;
  recommendation: string;
  confidence: number;
  evidenceGrade: string;
  dissent: boolean;
  dissentReason?: string;
  timestamp: string;
}

export interface CouncilSynthesis {
  synthesisId: string;
  consensusReached: boolean;
  consensusConfidence: number;
  recommendation: string;
  dissentingViews: Array<{ advisorId: string; reason: string }>;
  evidenceSummary: string;
  escalationRequired: boolean;
  escalationReason?: string;
}

export interface AdvisorRoutingRule {
  ruleId: string;
  inputPattern: string;            // topic/intent pattern
  requiredAdvisors: string[];
  optionalAdvisors: string[];
  conflictArbitration: "confidence-weighted" | "domain-priority" | "user-preference" | "escalate";
  minimumParticipants: number;
}

// ── Advisor Routing ─────────────────────────────────────────

export function routeToAdvisors(
  intent: string,
  domain: string,
  rules: AdvisorRoutingRule[],
  availableAdvisors: AdvisorDeclaration[],
): AdvisorDeclaration[] {
  const matchingRule = rules.find(r => intent.includes(r.inputPattern));
  if (!matchingRule) {
    return availableAdvisors.filter(a => a.domain === domain).slice(0, 3);
  }

  const required = availableAdvisors.filter(a => matchingRule.requiredAdvisors.includes(a.advisorId));
  const optional = availableAdvisors.filter(a => matchingRule.optionalAdvisors.includes(a.advisorId));
  return [...required, ...optional];
}

export function synthesizeCouncil(
  participants: AdvisorParticipation[],
): CouncilSynthesis {
  const dissenters = participants.filter(p => p.dissent);
  const avgConfidence = participants.reduce((sum, p) => sum + p.confidence, 0) / participants.length;
  const consensusReached = dissenters.length === 0 && avgConfidence > 0.7;

  return {
    synthesisId: crypto.randomUUID(),
    consensusReached,
    consensusConfidence: avgConfidence,
    recommendation: consensusReached
      ? participants[0].recommendation
      : "No consensus — presenting options to user",
    dissentingViews: dissenters.map(d => ({
      advisorId: d.advisorId,
      reason: d.dissentReason ?? "Dissent without stated reason",
    })),
    evidenceSummary: `${participants.length} advisors participated, avg confidence ${(avgConfidence * 100).toFixed(0)}%`,
    escalationRequired: !consensusReached || avgConfidence < 0.5,
    escalationReason: !consensusReached ? "Advisor disagreement requires user decision" : undefined,
  };
}
