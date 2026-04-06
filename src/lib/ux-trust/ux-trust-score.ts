// ═══════════════════════════════════════════════════════════════
// SITA OS — UX Trust Score Calculator
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
  hasDemoModeBadge: boolean;
  hasNetworkStatusBar: boolean;
  hasConfirmationDialog: boolean;
  hasDataFreshnessBadge: boolean;
  hasContextualEmptyState: boolean;
  hasOptimisticMutation: boolean;
  hasActionFeedback: boolean;
  hasUndoToast: boolean;
}

export function calculateTrustScore(input: TrustScoreInput): TrustScoreBreakdown {
  const checks: TrustCheck[] = [
    {
      name: "DemoModeBadge",
      weight: 10,
      score: input.hasDemoModeBadge ? 10 : 0,
      status: input.hasDemoModeBadge ? "pass" : "fail",
      detail: input.hasDemoModeBadge ? "Reality state visible to user" : "User cannot distinguish real vs demo data",
    },
    {
      name: "NetworkStatusBar",
      weight: 10,
      score: input.hasNetworkStatusBar ? 10 : 0,
      status: input.hasNetworkStatusBar ? "pass" : "fail",
      detail: input.hasNetworkStatusBar ? "Offline/degraded state visible" : "No connectivity feedback",
    },
    {
      name: "ConfirmationDialog",
      weight: 15,
      score: input.hasConfirmationDialog ? 15 : 0,
      status: input.hasConfirmationDialog ? "pass" : "fail",
      detail: input.hasConfirmationDialog ? "Destructive actions require confirmation" : "Destructive actions use browser confirm()",
    },
    {
      name: "DataFreshnessBadge",
      weight: 15,
      score: input.hasDataFreshnessBadge ? 15 : 0,
      status: input.hasDataFreshnessBadge ? "pass" : "fail",
      detail: input.hasDataFreshnessBadge ? "Data age visible to user" : "User cannot tell if data is stale",
    },
    {
      name: "ContextualEmptyState",
      weight: 15,
      score: input.hasContextualEmptyState ? 15 : 0,
      status: input.hasContextualEmptyState ? "pass" : "fail",
      detail: input.hasContextualEmptyState ? "Domain-specific empty states shown" : "No guidance when data is empty",
    },
    {
      name: "OptimisticMutation",
      weight: 10,
      score: input.hasOptimisticMutation ? 10 : 0,
      status: input.hasOptimisticMutation ? "pass" : "fail",
      detail: input.hasOptimisticMutation ? "CRUD actions have instant feedback" : "User waits for server response",
    },
    {
      name: "ActionFeedback",
      weight: 10,
      score: input.hasActionFeedback ? 10 : 0,
      status: input.hasActionFeedback ? "pass" : "fail",
      detail: input.hasActionFeedback ? "Success/error stacks visible" : "No mutation feedback beyond toasts",
    },
    {
      name: "UndoToast",
      weight: 15,
      score: input.hasUndoToast ? 15 : 0,
      status: input.hasUndoToast ? "pass" : "fail",
      detail: input.hasUndoToast ? "Delete actions support undo" : "Deletions are irreversible",
    },
  ];

  const total = checks.reduce((s, c) => s + c.score, 0);
  const max = checks.reduce((s, c) => s + c.weight, 0);

  const pct = (total / max) * 100;
  const grade = pct >= 95 ? "A+" : pct >= 85 ? "A" : pct >= 70 ? "B" : pct >= 55 ? "C" : pct >= 40 ? "D" : "F";

  return { total, max, grade, checks };
}
