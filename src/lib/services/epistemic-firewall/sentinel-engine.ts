// ═══════════════════════════════════════════════════════════════
// SITA OS — Sentinel Guard / Invariant Engine
// Runtime invariant enforcement for critical system rules
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "@/packages/contracts/_contract-scaffold";

export type InvariantSeverity = "warning" | "block" | "critical";
export type InvariantScope = "runtime" | "ci-cd" | "admin" | "audit";

export interface Invariant {
  id: string;
  name: string;
  description: string;
  scope: InvariantScope;
  severity: InvariantSeverity;
  domains: DomainId[];
  check: (context: InvariantContext) => InvariantCheckResult;
  enabled: boolean;
}

export interface InvariantContext {
  taskType?: string;
  domain?: DomainId;
  riskTier?: RiskTier;
  hasReceipt?: boolean;
  passedPolicyGate?: boolean;
  passedCostGate?: boolean;
  passedApprovalGate?: boolean;
  hasEvidenceGrade?: boolean;
  evidenceGrade?: string;
  deterministicVerified?: boolean;
  hasCiteCheck?: boolean;
  userId?: string;
  correlationId?: string;
  actionType?: string;
  providerCalled?: boolean;
  routedThroughBrain?: boolean;
  [key: string]: unknown;
}

export interface InvariantCheckResult {
  invariantId: string;
  passed: boolean;
  message: string;
  severity: InvariantSeverity;
  context?: Record<string, unknown>;
}

export interface SentinelReport {
  reportId: string;
  timestamp: string;
  totalChecks: number;
  passed: number;
  failed: number;
  blocked: number;
  warnings: number;
  critical: number;
  results: InvariantCheckResult[];
  overallHealthy: boolean;
}

const INVARIANTS: Invariant[] = [
  {
    id: "INV-001", name: "Receipt Required for High-Trust Actions",
    description: "All high-trust actions must produce receipts.",
    scope: "runtime", severity: "critical", domains: ["finance"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-001",
      passed: ctx.hasReceipt !== false || ctx.riskTier === "standard",
      message: ctx.hasReceipt === false && ctx.riskTier !== "standard" ? "High-trust action completed without receipt emission" : "Receipt requirement met",
      severity: "critical",
    }),
  },
  {
    id: "INV-002", name: "Policy Gate Required",
    description: "No action bypasses policy gate.",
    scope: "runtime", severity: "block", domains: ["finance", "business", "platform", "concierge", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-002",
      passed: ctx.passedPolicyGate !== false,
      message: ctx.passedPolicyGate === false ? "Action attempted without policy gate clearance" : "Policy gate cleared",
      severity: "block",
    }),
  },
  {
    id: "INV-003", name: "Cost Gate Required",
    description: "No AI invocation bypasses cost gate when budget policies exist.",
    scope: "runtime", severity: "block", domains: ["finance", "business", "platform", "concierge", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-003",
      passed: ctx.passedCostGate !== false,
      message: ctx.passedCostGate === false ? "AI invocation bypassed cost gate" : "Cost gate passed",
      severity: "block",
    }),
  },
  {
    id: "INV-004", name: "Finance Deterministic Verification",
    description: "No finance response passes without deterministic verification if policy requires it.",
    scope: "runtime", severity: "critical", domains: ["finance"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-004",
      passed: ctx.domain !== "finance" || ctx.deterministicVerified !== false,
      message: ctx.deterministicVerified === false ? "Finance response without deterministic verification" : "Deterministic verification met",
      severity: "critical",
    }),
  },
  {
    id: "INV-005", name: "No Unsupported Claims in High-Trust",
    description: "No unsupported claim reaches the user in high-trust domains.",
    scope: "runtime", severity: "block", domains: ["finance"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-005",
      passed: ctx.hasCiteCheck !== false,
      message: ctx.hasCiteCheck === false ? "Unsupported claims detected in high-trust domain output" : "Cite-check requirement met",
      severity: "block",
    }),
  },
  {
    id: "INV-006", name: "Approval Gate for Critical Actions",
    description: "Critical-risk actions must have approval before execution.",
    scope: "runtime", severity: "critical", domains: ["finance", "business"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-006",
      passed: ctx.riskTier !== "critical" || ctx.passedApprovalGate === true,
      message: ctx.riskTier === "critical" && !ctx.passedApprovalGate ? "Critical action without approval" : "Approval gate met",
      severity: "critical",
    }),
  },
  {
    id: "INV-007", name: "Evidence Grade Visibility",
    description: "Evidence grade must be visible to runtime and inspectable by admin.",
    scope: "runtime", severity: "warning", domains: ["finance"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-007",
      passed: ctx.hasEvidenceGrade !== false,
      message: ctx.hasEvidenceGrade === false ? "Evidence grade not recorded for high-trust output" : "Evidence grade recorded",
      severity: "warning",
    }),
  },
  {
    id: "INV-008", name: "Brain Routing Required",
    description: "No provider should be called directly — all must route through Brain/canonical path.",
    scope: "runtime", severity: "block", domains: ["finance", "business", "platform", "concierge", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-008",
      passed: !ctx.providerCalled || ctx.routedThroughBrain === true,
      message: ctx.providerCalled && !ctx.routedThroughBrain ? "Direct provider call detected (bypassed Brain)" : "Canonical routing confirmed",
      severity: "block",
    }),
  },
  {
    id: "INV-009", name: "Dedup Invariant",
    description: "No duplicate action execution within the same correlation.",
    scope: "runtime", severity: "warning", domains: ["platform", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-009",
      passed: true,
      message: "Dedup check delegated to Desk executor",
      severity: "warning",
    }),
  },
  {
    id: "INV-010", name: "Event Integrity",
    description: "Critical events must have correlation IDs and timestamps.",
    scope: "audit", severity: "warning", domains: ["platform", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-010",
      passed: !!ctx.correlationId,
      message: ctx.correlationId ? "Correlation ID present" : "Missing correlation ID on event",
      severity: "warning",
    }),
  },
  {
    id: "INV-011", name: "Connector Action Governance",
    description: "Connector actions must pass through Desk executor with receipt.",
    scope: "runtime", severity: "block", domains: ["platform", "cross-domain"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-011",
      passed: ctx.actionType !== "connector" || (ctx.passedPolicyGate === true && ctx.hasReceipt !== false),
      message: ctx.actionType === "connector" && !ctx.passedPolicyGate ? "Connector action bypassed governance" : "Connector governance met",
      severity: "block",
    }),
  },
  {
    id: "INV-012", name: "Assumption Disclosure",
    description: "High-impact assumptions must be disclosed to the user.",
    scope: "runtime", severity: "warning", domains: ["finance", "business"], enabled: true,
    check: (ctx) => ({
      invariantId: "INV-012",
      passed: true,
      message: "Assumption disclosure delegated to response assembler",
      severity: "warning",
    }),
  },
];

export function runSentinelCheck(context: InvariantContext, scopes?: InvariantScope[]): SentinelReport {
  const applicable = INVARIANTS.filter((inv) => {
    if (!inv.enabled) return false;
    if (scopes && !scopes.includes(inv.scope)) return false;
    if (context.domain && !inv.domains.includes(context.domain)) return false;
    return true;
  });

  const results = applicable.map((inv) => inv.check(context));
  const failed = results.filter((r) => !r.passed);
  const blocked = failed.filter((r) => r.severity === "block" || r.severity === "critical");

  return {
    reportId: `sentinel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    totalChecks: results.length, passed: results.filter((r) => r.passed).length,
    failed: failed.length, blocked: blocked.length,
    warnings: failed.filter((r) => r.severity === "warning").length,
    critical: failed.filter((r) => r.severity === "critical").length,
    results, overallHealthy: blocked.length === 0,
  };
}

const sentinelLog: SentinelReport[] = [];

export function logSentinelReport(report: SentinelReport): void {
  sentinelLog.push(report);
  if (sentinelLog.length > 500) sentinelLog.splice(0, sentinelLog.length - 500);
}

export function getSentinelHistory(limit = 50): SentinelReport[] {
  return sentinelLog.slice(-limit);
}

export function getSentinelStats(): { totalReports: number; healthyRate: number; totalViolations: number; byInvariant: Record<string, { passed: number; failed: number }> } {
  const byInvariant: Record<string, { passed: number; failed: number }> = {};
  for (const report of sentinelLog) {
    for (const r of report.results) {
      if (!byInvariant[r.invariantId]) byInvariant[r.invariantId] = { passed: 0, failed: 0 };
      if (r.passed) byInvariant[r.invariantId].passed++;
      else byInvariant[r.invariantId].failed++;
    }
  }
  const healthy = sentinelLog.filter((r) => r.overallHealthy).length;
  return { totalReports: sentinelLog.length, healthyRate: sentinelLog.length > 0 ? healthy / sentinelLog.length : 1, totalViolations: sentinelLog.reduce((sum, r) => sum + r.failed, 0), byInvariant };
}

export function getInvariants(): Invariant[] {
  return INVARIANTS;
}

export function getInvariantById(id: string): Invariant | undefined {
  return INVARIANTS.find((inv) => inv.id === id);
}
