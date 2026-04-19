// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub — Canonical status-tone maps
//
// Pure data module. No React. No service imports.
//
// Centralizes the domain-string → StatusTone mappings used across
// the AI Engineer hub panels so every board renders status tones
// through the canonical primitive (StatusBadge) instead of inlining
// raw color literals like `bg-emerald-500/15 text-emerald-500`.
//
// Class: REGISTRY (data only). Composed by panels via StatusBadge.
// ═══════════════════════════════════════════════════════════════
import type { StatusTone } from "@/components/primitives/status/StatusBadge";

// ── Severity (low / medium / high / critical) ─────────────────────
export const SEVERITY_TO_TONE: Record<string, StatusTone> = {
  critical: "danger",
  high: "warning",
  medium: "warning",
  low: "muted",
};

export function severityTone(value: string | null | undefined): StatusTone {
  if (!value) return "muted";
  return SEVERITY_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Risk (low / medium / high / critical) ─────────────────────────
export const RISK_TO_TONE: Record<string, StatusTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "muted",
};

export function riskTone(value: string | null | undefined): StatusTone {
  if (!value) return "muted";
  return RISK_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Finding lifecycle ─────────────────────────────────────────────
export const FINDING_STATUS_TO_TONE: Record<string, StatusTone> = {
  open: "info",
  acknowledged: "warning",
  routed: "info",
  resolved: "success",
  muted: "muted",
};

export function findingStatusTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return FINDING_STATUS_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Agent runtime status ──────────────────────────────────────────
export const AGENT_STATUS_TO_TONE: Record<string, StatusTone> = {
  idle: "success",
  running: "info",
  cooldown: "warning",
  suspended: "muted",
  error: "danger",
};

export function agentStatusTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return AGENT_STATUS_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Suggestion / decision lifecycle ───────────────────────────────
export const SUGGESTION_STATUS_TO_TONE: Record<string, StatusTone> = {
  proposed: "info",
  under_review: "warning",
  accepted: "success",
  rejected: "danger",
  in_progress: "info",
  done: "success",
  superseded: "muted",
};

export function suggestionStatusTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return SUGGESTION_STATUS_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Priority ──────────────────────────────────────────────────────
export const PRIORITY_TO_TONE: Record<string, StatusTone> = {
  urgent: "danger",
  high: "warning",
  normal: "info",
  low: "muted",
};

export function priorityTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return PRIORITY_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Generic outcome (succeeded / failed / pending) ────────────────
export const OUTCOME_TO_TONE: Record<string, StatusTone> = {
  succeeded: "success",
  success: "success",
  ok: "success",
  failed: "danger",
  failure: "danger",
  error: "danger",
  pending: "warning",
  in_progress: "info",
  running: "info",
  draft: "muted",
  draft_pending_review: "warning",
};

export function outcomeTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return OUTCOME_TO_TONE[value.toLowerCase()] ?? "neutral";
}

// ── Policy-draft lifecycle ────────────────────────────────────────
export const POLICY_DRAFT_STATUS_TO_TONE: Record<string, StatusTone> = {
  pending_review: "warning",
  approved: "success",
  rejected: "danger",
  changes_requested: "info",
  archived: "muted",
  applied_externally: "success",
};

export function policyDraftStatusTone(value: string | null | undefined): StatusTone {
  if (!value) return "neutral";
  return POLICY_DRAFT_STATUS_TO_TONE[value.toLowerCase()] ?? "neutral";
}
