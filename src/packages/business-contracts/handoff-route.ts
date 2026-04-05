// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Handoff & Routing Rules
// ═══════════════════════════════════════════════════════════════

export type HandoffTrigger = "stage-change" | "threshold" | "schedule" | "request" | "escalation" | "automation";

export interface HandoffRoute {
  id: string;
  name: string;
  fromRole: string;
  toRole: string;
  trigger: HandoffTrigger;
  conditions: HandoffCondition[];
  contextFields: string[];
  requiresAcknowledgment: boolean;
  slaMinutes: number;
  escalationPath: string[];
  active: boolean;
}

export interface HandoffCondition {
  field: string;
  operator: "equals" | "gt" | "lt" | "contains" | "in" | "not-in";
  value: unknown;
}

export interface HandoffExecution {
  id: string;
  routeId: string;
  fromUserId: string;
  toUserId: string;
  entityType: string;
  entityId: string;
  context: Record<string, unknown>;
  status: "pending" | "acknowledged" | "in-progress" | "completed" | "rejected" | "timed-out";
  initiatedAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
  slaBreached: boolean;
  proofId?: string;
  notes?: string;
}

export interface HandoffMetrics {
  period: string;
  totalHandoffs: number;
  avgAcknowledgmentMinutes: number;
  avgCompletionMinutes: number;
  slaBreachRate: number;
  byRoute: Array<{ routeId: string; count: number; avgTime: number; breachRate: number }>;
  rejectedCount: number;
  timedOutCount: number;
}
