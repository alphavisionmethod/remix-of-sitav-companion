// SITA OS — Demo Data: Admin Durability Board

export type DurabilityStatus = "persisted" | "pending" | "failed" | "noncanonical";

export interface DemoMutationRecord {
  id: string;
  actor: string;
  surface: string;
  mutationType: string;
  targetType: string;
  targetId: string;
  submittedAt: string;
  durabilityStatus: DurabilityStatus;
  canonicalWritePath: boolean;
  lineageComplete: boolean;
  rollbackEligible: boolean;
  proofRef?: string;
}

export const DEMO_MUTATIONS: DemoMutationRecord[] = [
  { id: "mut-001", actor: "admin@sita.os", surface: "PolicySimulator", mutationType: "policy.create", targetType: "policy", targetId: "pol-42", submittedAt: "2026-04-05T10:23:00Z", durabilityStatus: "persisted", canonicalWritePath: true, lineageComplete: true, rollbackEligible: true, proofRef: "prf-901" },
  { id: "mut-002", actor: "system", surface: "ConnectorGateway", mutationType: "connector.refresh", targetType: "connector", targetId: "conn-7", submittedAt: "2026-04-05T10:21:00Z", durabilityStatus: "persisted", canonicalWritePath: true, lineageComplete: true, rollbackEligible: false },
  { id: "mut-003", actor: "admin@sita.os", surface: "UserManagement", mutationType: "user.role.update", targetType: "user_role", targetId: "ur-18", submittedAt: "2026-04-05T10:18:00Z", durabilityStatus: "pending", canonicalWritePath: true, lineageComplete: false, rollbackEligible: true },
  { id: "mut-004", actor: "workflow-engine", surface: "WorkflowReplay", mutationType: "workflow.retry", targetType: "workflow_run", targetId: "wf-55", submittedAt: "2026-04-05T10:15:00Z", durabilityStatus: "failed", canonicalWritePath: false, lineageComplete: false, rollbackEligible: false },
  { id: "mut-005", actor: "admin@sita.os", surface: "ApprovalQueue", mutationType: "approval.override", targetType: "approval", targetId: "apv-33", submittedAt: "2026-04-05T10:10:00Z", durabilityStatus: "noncanonical", canonicalWritePath: false, lineageComplete: false, rollbackEligible: true },
];
