// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Support Case
// ═══════════════════════════════════════════════════════════════

export type SupportCasePriority = "P0" | "P1" | "P2" | "P3";
export type SupportCaseStatus = "open" | "triaged" | "investigating" | "waiting-customer" | "resolved" | "closed";

export interface SupportCase {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  description: string;
  priority: SupportCasePriority;
  status: SupportCaseStatus;
  category: string;
  assignedTo?: string;
  diagnosticBundleId?: string;
  linkedIncidentIds: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  supportSafe: boolean;
}
