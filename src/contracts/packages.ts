// ═══════════════════════════════════════════════════════════════
// SITA OS — Contracts Public Barrel
//
// Re-exports the canonical contract families from src/packages/.
// Consumers should prefer `@/contracts/*` over `@/packages/*` so
// the canonical contract surface is stable even if the underlying
// physical layout changes.
//
// Phase B3 deliverable from architecture-remediation wave.
// ═══════════════════════════════════════════════════════════════

// Re-export the consolidated packages barrel for unified access.
export * from "@/packages";

// Named family re-exports (curated, expand as families consolidate).
export type * as AIContracts from "@/packages/ai-contracts";
export type * as AuditContracts from "@/packages/audit-contracts";
export type * as BoardroomContracts from "@/packages/boardroom-contracts";
export type * as BusinessContracts from "@/packages/business-contracts";
export type * as ConciergeContracts from "@/packages/concierge-contracts";
export type * as EnterpriseContracts from "@/packages/enterprise-contracts";
export type * as FinanceContracts from "@/packages/finance-contracts";
export type * as PolicyContracts from "@/packages/policy-contracts";
export type * as TelemetryContracts from "@/packages/telemetry";
export type * as WorkflowContracts from "@/packages/workflow-primitives";
