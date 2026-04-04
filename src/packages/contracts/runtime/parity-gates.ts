// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Parity Gate Test Contracts
// Canonical test cases proving command/proof/approval equivalence
// across all primary surfaces
// ═══════════════════════════════════════════════════════════════

import type { SurfaceId, DegradedFallbackStrategy, UnifiedApprovalMode } from "./unified-surface-runtime";

// ── Test Case Definition ─────────────────────────────────────

export interface ParityTestCase {
  id: string;
  name: string;
  description: string;
  command: {
    action: string;
    target: string;
    requiresTrust: number;
  };
  expectedProof: {
    emitsReceipt: boolean;
    receiptType: string;
    chainRequired: boolean;
  };
  expectedApproval: {
    mode: UnifiedApprovalMode;
    requiredApprovers: number;
  };
  expectedDegraded: {
    offlineFallback: DegradedFallbackStrategy;
    lowTrustFallback: DegradedFallbackStrategy;
  };
  applicableSurfaces: SurfaceId[];
}

// ── Gate Result ──────────────────────────────────────────────

export type ParityGateVerdict = "pass" | "fail" | "skip" | "error";

export interface ParityGateResult {
  testCaseId: string;
  surface: SurfaceId;
  verdict: ParityGateVerdict;
  proofMatch: boolean;
  approvalMatch: boolean;
  degradedMatch: boolean;
  details?: string;
  executedAt: string;
  durationMs: number;
}

export interface ParityGateReport {
  runId: string;
  runAt: string;
  totalCases: number;
  passed: number;
  failed: number;
  skipped: number;
  results: ParityGateResult[];
  overallVerdict: "pass" | "fail";
}

// ── Canonical Test Cases ─────────────────────────────────────
// These MUST produce identical results across all surfaces

export const PARITY_TEST_CASES: ParityTestCase[] = [
  {
    id: "parity-001",
    name: "Send payment command",
    description: "Payment commands must emit receipt, require dual approval, and refuse when offline",
    command: { action: "payment.send", target: "payment-service", requiresTrust: 80 },
    expectedProof: { emitsReceipt: true, receiptType: "payment", chainRequired: true },
    expectedApproval: { mode: "dual", requiredApprovers: 2 },
    expectedDegraded: { offlineFallback: "refuse", lowTrustFallback: "refuse" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-002",
    name: "Read dashboard data",
    description: "Read-only dashboard access needs no approval, can use cache when offline",
    command: { action: "dashboard.read", target: "analytics-service", requiresTrust: 20 },
    expectedProof: { emitsReceipt: false, receiptType: "none", chainRequired: false },
    expectedApproval: { mode: "none", requiredApprovers: 0 },
    expectedDegraded: { offlineFallback: "cache-only", lowTrustFallback: "read-only" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-003",
    name: "Update trust settings",
    description: "Trust settings changes must emit system receipt and require owner approval",
    command: { action: "trust.update-settings", target: "trust-service", requiresTrust: 90 },
    expectedProof: { emitsReceipt: true, receiptType: "system", chainRequired: true },
    expectedApproval: { mode: "owner-only", requiredApprovers: 1 },
    expectedDegraded: { offlineFallback: "refuse", lowTrustFallback: "refuse" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-004",
    name: "Create workflow",
    description: "Workflow creation emits action receipt, single approval, queues when offline",
    command: { action: "workflow.create", target: "workflow-engine", requiresTrust: 50 },
    expectedProof: { emitsReceipt: true, receiptType: "action", chainRequired: true },
    expectedApproval: { mode: "single", requiredApprovers: 1 },
    expectedDegraded: { offlineFallback: "queue-for-sync", lowTrustFallback: "queue-for-sync" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-005",
    name: "View proof chain",
    description: "Proof chain viewing is read-only, no approval, cache fallback offline",
    command: { action: "proof.view-chain", target: "proof-service", requiresTrust: 10 },
    expectedProof: { emitsReceipt: false, receiptType: "none", chainRequired: false },
    expectedApproval: { mode: "none", requiredApprovers: 0 },
    expectedDegraded: { offlineFallback: "cache-only", lowTrustFallback: "read-only" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-006",
    name: "Advisor recommendation action",
    description: "Acting on advisor recommendation needs action receipt, single approval, local fallback offline",
    command: { action: "advisor.act-on-recommendation", target: "advisor-service", requiresTrust: 60 },
    expectedProof: { emitsReceipt: true, receiptType: "action", chainRequired: true },
    expectedApproval: { mode: "single", requiredApprovers: 1 },
    expectedDegraded: { offlineFallback: "local-fallback", lowTrustFallback: "queue-for-sync" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-007",
    name: "Delete user data",
    description: "Data deletion requires dual approval, system receipt, and refuses when degraded",
    command: { action: "data.delete", target: "data-service", requiresTrust: 95 },
    expectedProof: { emitsReceipt: true, receiptType: "system", chainRequired: true },
    expectedApproval: { mode: "dual", requiredApprovers: 2 },
    expectedDegraded: { offlineFallback: "refuse", lowTrustFallback: "refuse" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
  {
    id: "parity-008",
    name: "Connect external service",
    description: "OAuth connections emit action receipt, single approval, refuse offline",
    command: { action: "connection.oauth", target: "connection-service", requiresTrust: 40 },
    expectedProof: { emitsReceipt: true, receiptType: "action", chainRequired: true },
    expectedApproval: { mode: "single", requiredApprovers: 1 },
    expectedDegraded: { offlineFallback: "refuse", lowTrustFallback: "queue-for-sync" },
    applicableSurfaces: ["web", "admin", "desktop", "mobile"],
  },
];
