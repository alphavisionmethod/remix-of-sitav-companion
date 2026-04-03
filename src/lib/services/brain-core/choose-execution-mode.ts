// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Execution Mode Selection
// Maps intent characteristics to execution mode
// ═══════════════════════════════════════════════════════════════

import type { ParsedIntent, ExecutionMode } from "./orchestrate-intent";

export interface ExecutionModeDecision {
  mode: ExecutionMode;
  reason: string;
  requiresApproval: boolean;
  approvalType?: "single" | "dual" | "owner-only";
  canAutoExecute: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
}

const RISK_MATRIX: Record<string, Record<string, "low" | "medium" | "high" | "critical">> = {
  query: { low: "low", medium: "low", high: "low", critical: "low" },
  action: { low: "medium", medium: "high", high: "high", critical: "critical" },
  simulation: { low: "low", medium: "low", high: "medium", critical: "medium" },
  approval: { low: "medium", medium: "medium", high: "high", critical: "critical" },
  boardroom: { low: "low", medium: "low", high: "low", critical: "medium" },
  diagnostic: { low: "low", medium: "low", high: "low", critical: "low" },
};

export function selectExecutionMode(intent: ParsedIntent): ExecutionModeDecision {
  const riskLevel = RISK_MATRIX[intent.type]?.[intent.urgency] || "medium";

  let mode: ExecutionMode;
  let requiresApproval = false;
  let approvalType: ExecutionModeDecision["approvalType"];
  let canAutoExecute = false;
  let reason: string;

  switch (riskLevel) {
    case "low":
      mode = intent.type === "query" ? "observe" : "recommend";
      canAutoExecute = true;
      reason = "Low risk — can auto-execute within policy bounds";
      break;
    case "medium":
      mode = "draft";
      reason = "Medium risk — draft prepared for review";
      break;
    case "high":
      mode = "approval-required";
      requiresApproval = true;
      approvalType = "single";
      reason = "High risk — single approval required before execution";
      break;
    case "critical":
      mode = "approval-required";
      requiresApproval = true;
      approvalType = "dual";
      reason = "Critical risk — dual approval required (owner + trusted device)";
      break;
  }

  return { mode, reason, requiresApproval, approvalType, canAutoExecute, riskLevel };
}

export function canBypassApproval(intent: ParsedIntent, trustLevel: number): boolean {
  if (intent.urgency === "critical") return false;
  if (intent.type === "query" || intent.type === "diagnostic") return true;
  return trustLevel >= 90 && intent.urgency === "low";
}
