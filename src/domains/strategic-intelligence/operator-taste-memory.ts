// ═══════════════════════════════════════════════════════════════
// SITA OS — Operator Taste Memory
// Learns operator preferences to reduce waste and improve acceptance.
// ═══════════════════════════════════════════════════════════════

export interface OperatorTasteProfile {
  profileId: string;
  operatorId: string;
  updatedAt: string;

  // Preferences
  preferredSummaryDepth: "brief" | "standard" | "detailed" | "exhaustive";
  preferredExplanationStyle: "technical" | "business" | "mixed" | "minimal";
  preferredConfidenceThreshold: number;
  preferredEvidenceFormat: "inline" | "appendix" | "linked" | "minimal";
  preferredInterventionStyle: "proactive" | "on-request" | "minimal";

  // Behavioral patterns
  approvalBehavior: ApprovalBehavior;
  rejectionPatterns: RejectionPattern[];
  commonOverrides: OverridePattern[];

  // Domain preferences
  domainPreferences: Record<string, DomainTaste>;

  // Computed
  predictedAcceptanceRate: number;
  wasteReductionPotential: number;
}

export interface ApprovalBehavior {
  avgApprovalTimeMs: number;
  autoApproveThreshold: number;       // confidence above which they always approve
  alwaysReviewDomains: string[];
  quickApproveTypes: string[];
}

export interface RejectionPattern {
  reason: string;
  frequency: number;
  taskTypes: string[];
  domains: string[];
}

export interface OverridePattern {
  originalOutput: string;
  correctedTo: string;
  frequency: number;
  domains: string[];
}

export interface DomainTaste {
  domain: string;
  summaryDepth: "brief" | "standard" | "detailed";
  confidenceThreshold: number;
  preferredAgents: string[];
}

export interface TasteSignal {
  operatorId: string;
  signalType: "approval" | "rejection" | "override" | "edit" | "preference_change";
  domain: string;
  taskType: string;
  detail: string;
  timestamp: string;
}

// ── Profile Builder ────────────────────────────────────────

export function createDefaultProfile(operatorId: string): OperatorTasteProfile {
  return {
    profileId: `taste-${operatorId}`,
    operatorId,
    updatedAt: new Date().toISOString(),
    preferredSummaryDepth: "standard",
    preferredExplanationStyle: "mixed",
    preferredConfidenceThreshold: 75,
    preferredEvidenceFormat: "inline",
    preferredInterventionStyle: "proactive",
    approvalBehavior: {
      avgApprovalTimeMs: 30000,
      autoApproveThreshold: 90,
      alwaysReviewDomains: ["investment-finance", "compliance-trust"],
      quickApproveTypes: ["self_heal", "monitoring"],
    },
    rejectionPatterns: [],
    commonOverrides: [],
    domainPreferences: {},
    predictedAcceptanceRate: 0.85,
    wasteReductionPotential: 0,
  };
}

export function updateProfileFromSignal(profile: OperatorTasteProfile, signal: TasteSignal): OperatorTasteProfile {
  const updated = { ...profile, updatedAt: new Date().toISOString() };

  switch (signal.signalType) {
    case "rejection":
      updated.rejectionPatterns = [
        ...updated.rejectionPatterns.filter(p => p.reason !== signal.detail),
        {
          reason: signal.detail,
          frequency: (updated.rejectionPatterns.find(p => p.reason === signal.detail)?.frequency || 0) + 1,
          taskTypes: [signal.taskType],
          domains: [signal.domain],
        },
      ];
      // If frequently rejecting, raise confidence threshold
      if (updated.rejectionPatterns.some(p => p.frequency > 3)) {
        updated.preferredConfidenceThreshold = Math.min(95, updated.preferredConfidenceThreshold + 2);
      }
      break;

    case "override":
      updated.commonOverrides = [
        ...updated.commonOverrides.filter(o => o.originalOutput !== signal.detail),
        {
          originalOutput: signal.detail,
          correctedTo: "",
          frequency: (updated.commonOverrides.find(o => o.originalOutput === signal.detail)?.frequency || 0) + 1,
          domains: [signal.domain],
        },
      ];
      break;

    case "approval":
      updated.approvalBehavior = {
        ...updated.approvalBehavior,
        avgApprovalTimeMs: Math.round((updated.approvalBehavior.avgApprovalTimeMs + 15000) / 2),
      };
      break;
  }

  // Recalculate waste reduction potential
  const totalRejections = updated.rejectionPatterns.reduce((s, p) => s + p.frequency, 0);
  const totalOverrides = updated.commonOverrides.reduce((s, o) => s + o.frequency, 0);
  updated.wasteReductionPotential = Math.min(40, (totalRejections + totalOverrides) * 2);

  return updated;
}

export function shouldAdaptOutput(profile: OperatorTasteProfile, domain: string, confidence: number): {
  adaptSummaryDepth: boolean;
  adaptExplanation: boolean;
  requiresReview: boolean;
  summaryDepth: string;
  explanationStyle: string;
} {
  const domainTaste = profile.domainPreferences[domain];
  const depth = domainTaste?.summaryDepth || profile.preferredSummaryDepth;
  const threshold = domainTaste?.confidenceThreshold || profile.preferredConfidenceThreshold;

  return {
    adaptSummaryDepth: !!domainTaste,
    adaptExplanation: profile.preferredExplanationStyle !== "mixed",
    requiresReview: confidence < threshold || profile.approvalBehavior.alwaysReviewDomains.includes(domain),
    summaryDepth: depth,
    explanationStyle: profile.preferredExplanationStyle,
  };
}
