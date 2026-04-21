// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Ops Types
// ═══════════════════════════════════════════════════════════════

export type RecoveryJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type RecoveryActionType =
  | "workflow-retry"
  | "webhook-replay"
  | "cache-flush"
  | "connection-reset"
  | "queue-drain"
  | "data-reconciliation"
  | "diagnostic-export";

export interface RecoveryJob {
  id: string;
  actionType: RecoveryActionType;
  label: string;
  status: RecoveryJobStatus;
  progress: number; // 0-100
  startedAt: string;
  completedAt: string | null;
  error: string | null;
  operatorId: string;
  isDryRun: boolean;
  parameters: Record<string, unknown>;
  result: Record<string, unknown> | null;
}

export interface WebhookEvent {
  id: string;
  eventType: string;
  status: "delivered" | "failed" | "pending" | "replayed";
  timestamp: string;
  payload: Record<string, unknown>;
  errorMessage: string | null;
  provider: string;
  retryCount: number;
}

export interface WebhookFilterState {
  eventType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface DiagnosticExportAudit {
  id: string;
  exportedAt: string;
  exportedBy: string;
  parameters: Record<string, unknown>;
  resultStatus: "success" | "partial" | "failed";
  fileSize: number | null;
  bundleId: string;
  downloadUrl: string | null;
}