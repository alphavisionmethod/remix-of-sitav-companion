// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Autopilot Domain Types
// ═══════════════════════════════════════════════════════════════

import type { BaseContract, Timestamped, TenantScoped } from "../_contract-scaffold";

export type PipelineStageType = "lead" | "qualified" | "proposal" | "negotiation" | "closing" | "won" | "lost" | "churned";

export type PlaybookTrigger = "stage-change" | "time-based" | "signal-detected" | "manual" | "score-threshold";

export type RecoveryLoopStatus = "active" | "paused" | "completed" | "abandoned";

export interface PipelineStage extends BaseContract, TenantScoped {
  name: string;
  type: PipelineStageType;
  order: number;
  entryCount: number;
  avgDaysInStage: number;
  conversionRate: number;
  totalValue: number;
  currency: string;
  automations: PlaybookRule[];
}

export interface PlaybookRule extends Timestamped, TenantScoped {
  name: string;
  description: string;
  trigger: PlaybookTrigger;
  triggerCondition: Record<string, unknown>;
  actions: PlaybookAction[];
  enabled: boolean;
  executionCount: number;
  successCount: number;
  lastTriggered?: string;
  cooldownMinutes: number;
  priority: number;
}

export interface PlaybookAction {
  type: "send-email" | "create-task" | "update-score" | "notify-owner" | "schedule-call" | "apply-tag" | "move-stage";
  params: Record<string, unknown>;
  delayMinutes: number;
  condition?: Record<string, unknown>;
}

export interface RecoveryLoop extends Timestamped, TenantScoped {
  dealId: string;
  dealName: string;
  originalValue: number;
  recoveredValue: number;
  currency: string;
  status: RecoveryLoopStatus;
  reason: string;
  touchpoints: RecoveryTouchpoint[];
  nextActionDate?: string;
  expiresAt: string;
}

export interface RecoveryTouchpoint {
  id: string;
  date: string;
  channel: string;
  action: string;
  outcome: "positive" | "neutral" | "negative" | "no-response";
  notes?: string;
}

export interface LeadScore extends BaseContract, TenantScoped {
  leadId: string;
  score: number;
  signals: LeadSignal[];
  predictedConversion: number;
  segment: "hot" | "warm" | "cool" | "cold";
  lastScored: string;
}

export interface LeadSignal {
  type: string;
  weight: number;
  value: unknown;
  detectedAt: string;
}
