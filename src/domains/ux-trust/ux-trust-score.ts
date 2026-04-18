// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Score Calculator (Enhanced — 16 checks)
// Runtime audit of trust patterns across surfaces
// ═══════════════════════════════════════════════════════════════

export interface TrustScoreBreakdown {
  total: number;
  max: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  checks: TrustCheck[];
}

export interface TrustCheck {
  name: string;
  weight: number;
  score: number;
  status: "pass" | "partial" | "fail";
  detail: string;
}

export interface TrustScoreInput {
  // Original 8
  hasDemoModeBadge: boolean;
  hasNetworkStatusBar: boolean;
  hasConfirmationDialog: boolean;
  hasDataFreshnessBadge: boolean;
  hasContextualEmptyState: boolean;
  hasOptimisticMutation: boolean;
  hasActionFeedback: boolean;
  hasUndoToast: boolean;
  // New 8
  hasAIConfidenceDisclosure?: boolean;
  hasContextOrientation?: boolean;
  hasRecoveryPrompt?: boolean;
  hasCognitiveLoadGuard?: boolean;
  hasActionConsequencePreview?: boolean;
  hasDegradedServiceBanner?: boolean;
  hasInformationLayers?: boolean;
  hasMicrocopySystem?: boolean;
}

function check(name: string, weight: number, present: boolean | undefined, passDetail: string, failDetail: string): TrustCheck {
  const has = present ?? false;
  return { name, weight, score: has ? weight : 0, status: has ? "pass" : "fail", detail: has ? passDetail : failDetail };
}

export function calculateTrustScore(input: TrustScoreInput): TrustScoreBreakdown {
  const checks: TrustCheck[] = [
    // Original 8
    check("DemoModeBadge", 8, input.hasDemoModeBadge, "Reality state visible to user", "User cannot distinguish real vs demo data"),
    check("NetworkStatusBar", 8, input.hasNetworkStatusBar, "Offline/degraded state visible", "No connectivity feedback"),
    check("ConfirmationDialog", 8, input.hasConfirmationDialog, "Destructive actions require confirmation", "Destructive actions lack confirmation"),
    check("DataFreshnessBadge", 8, input.hasDataFreshnessBadge, "Data age visible to user", "User cannot tell if data is stale"),
    check("ContextualEmptyState", 7, input.hasContextualEmptyState, "Domain-specific empty states shown", "No guidance when data is empty"),
    check("OptimisticMutation", 5, input.hasOptimisticMutation, "CRUD actions have instant feedback", "User waits for server response"),
    check("ActionFeedback", 5, input.hasActionFeedback, "Success/error stacks visible", "No mutation feedback beyond toasts"),
    check("UndoToast", 7, input.hasUndoToast, "Delete actions support undo", "Deletions are irreversible"),
    // New 8
    check("AIConfidenceDisclosure", 8, input.hasAIConfidenceDisclosure, "AI outputs show confidence and source", "AI outputs lack transparency"),
    check("ContextOrientation", 7, input.hasContextOrientation, "User always knows where they are", "No orientation cues on surfaces"),
    check("RecoveryPrompt", 5, input.hasRecoveryPrompt, "Interrupted flows offer resume", "No recovery from interrupted actions"),
    check("CognitiveLoadGuard", 6, input.hasCognitiveLoadGuard, "UI adapts to cognitive load", "No load-aware UI throttling"),
    check("ActionConsequencePreview", 7, input.hasActionConsequencePreview, "Destructive actions show consequences", "No consequence preview before destructive actions"),
    check("DegradedServiceBanner", 5, input.hasDegradedServiceBanner, "Per-service degradation communicated", "No service-specific degradation feedback"),
    check("InformationLayers", 3, input.hasInformationLayers, "Progressive disclosure available", "No information layering"),
    check("MicrocopySystem", 2, input.hasMicrocopySystem, "Centralized premium copy engine active", "Ad-hoc copy patterns"),
  ];

  const total = checks.reduce((s, c) => s + c.score, 0);
  const max = checks.reduce((s, c) => s + c.weight, 0);
  const pct = (total / max) * 100;
  const grade = pct >= 95 ? "A+" : pct >= 85 ? "A" : pct >= 70 ? "B" : pct >= 55 ? "C" : pct >= 40 ? "D" : "F";

  return { total, max, grade, checks };
}
