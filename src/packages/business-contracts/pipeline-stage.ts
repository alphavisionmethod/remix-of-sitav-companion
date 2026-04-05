// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Pipeline Stage Configuration
// ═══════════════════════════════════════════════════════════════

export interface PipelineStageConfig {
  id: string;
  name: string;
  order: number;
  probability: number;
  requiredFields: string[];
  exitCriteria: string[];
  automations: PipelineAutomation[];
  maxDaysAllowed: number;
  staleWarningDays: number;
  color: string;
  icon: string;
}

export interface PipelineAutomation {
  trigger: "enter" | "exit" | "stale" | "value-change";
  action: "notify" | "create-task" | "send-email" | "update-field" | "escalate";
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface PipelineConfig {
  id: string;
  name: string;
  stages: PipelineStageConfig[];
  defaultCurrency: string;
  forecastMethod: "weighted" | "category" | "ai-predicted";
  createdAt: string;
  updatedAt: string;
}

export interface PipelineSnapshot {
  pipelineId: string;
  snapshotDate: string;
  totalDeals: number;
  totalValueCents: number;
  weightedValueCents: number;
  stageBreakdown: Array<{ stageId: string; stageName: string; dealCount: number; valueCents: number; avgDaysInStage: number }>;
  velocityDays: number;
  conversionRate: number;
  staleDeals: number;
  addedThisPeriod: number;
  closedWonThisPeriod: number;
  closedLostThisPeriod: number;
}
