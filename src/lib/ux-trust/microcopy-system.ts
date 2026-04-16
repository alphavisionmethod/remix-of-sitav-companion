// ═══════════════════════════════════════════════════════════════
// SITA OS — Microcopy System
// Centralized premium-toned copy engine for all UI states
// ═══════════════════════════════════════════════════════════════

// ── Error Copy ─────────────────────────────────────────────────

export interface ErrorCopyContext {
  service?: string;
  action?: string;
  isRetryable?: boolean;
  technicalDetail?: string;
}

export function getErrorCopy(context: ErrorCopyContext) {
  const what = context.action
    ? `Unable to ${context.action}`
    : context.service
      ? `${context.service} encountered an issue`
      : "Something went wrong";

  const stillWorks = context.service
    ? "Other areas of the system remain available."
    : "Your data is safe and other features are unaffected.";

  const nextStep = context.isRetryable
    ? "You can retry this action, or come back in a moment."
    : "Please try again later, or contact support if this persists.";

  return { what, stillWorks, nextStep, technical: context.technicalDetail };
}

// ── AI Copy ────────────────────────────────────────────────────

export type AIConfidenceLevel = "high" | "medium" | "low" | "unknown";
export type AIOutputType = "suggestion" | "recommendation" | "analysis" | "prediction";

export interface AICopyContext {
  confidence: number; // 0-1
  outputType?: AIOutputType;
  isSimulated?: boolean;
  sourceSummary?: string;
  modelUsed?: string;
}

export function getAICopy(context: AICopyContext) {
  const level = getConfidenceLevel(context.confidence);

  const labels: Record<AIConfidenceLevel, string> = {
    high: "High-confidence",
    medium: "Moderate-confidence",
    low: "Low-confidence",
    unknown: "Unverified",
  };

  const outputLabels: Record<AIOutputType, string> = {
    suggestion: "Suggestion",
    recommendation: "Recommendation",
    analysis: "Analysis",
    prediction: "Forecast",
  };

  const type = context.outputType ?? "suggestion";
  const label = `${labels[level]} ${outputLabels[type].toLowerCase()}`;
  const reviewNeeded = level === "low" || level === "unknown";
  const simulatedNote = context.isSimulated ? "This result is simulated — not based on live data." : undefined;
  const sourceNote = context.sourceSummary ? `Based on: ${context.sourceSummary}` : undefined;

  return {
    label,
    confidenceLevel: level,
    confidencePercent: Math.round(context.confidence * 100),
    reviewNeeded,
    reviewMessage: reviewNeeded ? "Human review recommended before acting on this." : undefined,
    simulatedNote,
    sourceNote,
    type: outputLabels[type],
  };
}

export function getConfidenceLevel(score: number): AIConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  if (score > 0) return "low";
  return "unknown";
}

// ── Action Copy ────────────────────────────────────────────────

export interface ActionCopyContext {
  action: string;
  isDestructive?: boolean;
  isIrreversible?: boolean;
  affectedCount?: number;
  targetName?: string;
}

export function getActionCopy(context: ActionCopyContext) {
  const { action, isDestructive, isIrreversible, affectedCount, targetName } = context;

  let buttonLabel = action;
  if (isDestructive && isIrreversible) {
    buttonLabel = `Permanently ${action.toLowerCase()}`;
  } else if (isDestructive) {
    buttonLabel = `${action} (can be undone)`;
  }

  const consequence = isIrreversible
    ? `This cannot be undone.${affectedCount ? ` ${affectedCount} item${affectedCount > 1 ? "s" : ""} will be affected.` : ""}`
    : isDestructive
      ? `This can be undone within a short window.${affectedCount ? ` ${affectedCount} item${affectedCount > 1 ? "s" : ""} will be affected.` : ""}`
      : undefined;

  const target = targetName ? `"${targetName}"` : undefined;

  return { buttonLabel, consequence, target };
}

// ── State Copy ─────────────────────────────────────────────────

export type StateCopyType = "loading" | "degraded" | "stale" | "empty" | "connecting" | "offline";

export function getStateCopy(type: StateCopyType, context?: { service?: string; ageLabel?: string }) {
  const templates: Record<StateCopyType, { title: string; description: string }> = {
    loading: {
      title: "Loading…",
      description: "Retrieving the latest data for you.",
    },
    degraded: {
      title: context?.service ? `${context.service} is experiencing issues` : "Some features are temporarily limited",
      description: "Core functionality remains available. We're working on resolving this.",
    },
    stale: {
      title: "Data may be outdated",
      description: context?.ageLabel ? `Last updated ${context.ageLabel}. Refresh to get the latest.` : "This data hasn't been refreshed recently.",
    },
    empty: {
      title: "Nothing here yet",
      description: "This section will populate as you use the system.",
    },
    connecting: {
      title: "Connecting…",
      description: "Establishing a secure connection to your services.",
    },
    offline: {
      title: "You're offline",
      description: "Some features are limited while offline. Changes will sync when you reconnect.",
    },
  };
  return templates[type];
}

// ── Freshness Copy ─────────────────────────────────────────────

export function getFreshnessCopy(ageMs: number): { label: string; tone: "fresh" | "aging" | "stale" | "expired" } {
  if (ageMs < 5_000) return { label: "Just now", tone: "fresh" };
  if (ageMs < 60_000) return { label: `${Math.floor(ageMs / 1000)}s ago`, tone: "fresh" };
  if (ageMs < 300_000) return { label: `${Math.floor(ageMs / 60_000)}m ago`, tone: "aging" };
  if (ageMs < 1_800_000) return { label: `${Math.floor(ageMs / 60_000)}m ago — may be outdated`, tone: "stale" };
  if (ageMs < 3_600_000) return { label: `${Math.floor(ageMs / 3_600_000)}h ago — likely outdated`, tone: "expired" };
  return { label: `${Math.floor(ageMs / 3_600_000)}h+ ago — data is old`, tone: "expired" };
}
