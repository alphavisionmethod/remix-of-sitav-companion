// ═══════════════════════════════════════════════════════════════
// SITA OS — Verification Engine
// Postcondition verification after execution, expected vs actual
// comparison, verification receipt generation, and auto-rollback
// recommendation on failure
// Canonical contracts: VerificationRecord from contracts/proof
// ═══════════════════════════════════════════════════════════════

import type { VerificationRecord as CanonicalVerificationRecord } from "@/packages/contracts/proof/verification-record";

export type { CanonicalVerificationRecord };

export interface VerificationRule {
  id: string;
  name: string;
  description: string;
  capabilityPattern: string;   // matches capability IDs (glob-like)
  check: (expected: Record<string, unknown>, actual: Record<string, unknown>) => VerificationCheckResult;
}

export interface VerificationCheckResult {
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
  severity?: "info" | "warning" | "error" | "critical";
}

export interface VerificationResult {
  id: string;
  correlationId: string;
  capabilityId: string;
  envelopeId: string;
  timestamp: number;
  passed: boolean;
  checks: { ruleId: string; ruleName: string; result: VerificationCheckResult }[];
  overallSeverity: "info" | "warning" | "error" | "critical";
  rollbackRecommended: boolean;
  rollbackReason?: string;
  durationMs: number;
}

// ── Built-in verification rules ─────────────────────────────────

const BUILTIN_RULES: VerificationRule[] = [
  {
    id: "result-not-null",
    name: "Result exists",
    description: "Execution must produce a non-null result",
    capabilityPattern: "*",
    check: (_expected, actual) => ({
      passed: actual !== null && actual !== undefined && Object.keys(actual).length > 0,
      message: actual && Object.keys(actual).length > 0 ? "Result is present" : "Result is empty or null",
      severity: "error",
    }),
  },
  {
    id: "no-error-field",
    name: "No error in result",
    description: "Result should not contain error indicators",
    capabilityPattern: "*",
    check: (_expected, actual) => {
      const hasError = "error" in actual || "errorCode" in actual || "errorMessage" in actual;
      return {
        passed: !hasError,
        message: hasError ? `Result contains error: ${actual.error ?? actual.errorMessage}` : "No error detected",
        severity: hasError ? "critical" : "info",
      };
    },
  },
  {
    id: "status-success",
    name: "Status is successful",
    description: "Result status field should indicate success",
    capabilityPattern: "*",
    check: (_expected, actual) => {
      if (!("status" in actual)) return { passed: true, message: "No status field — skipped", severity: "info" };
      const status = String(actual.status).toLowerCase();
      const isSuccess = ["success", "completed", "ok", "done", "created", "updated"].includes(status);
      return {
        passed: isSuccess,
        message: isSuccess ? `Status: ${actual.status}` : `Unexpected status: ${actual.status}`,
        severity: isSuccess ? "info" : "error",
      };
    },
  },
  {
    id: "amount-match",
    name: "Amount matches expected",
    description: "If an amount is expected, verify it matches within tolerance",
    capabilityPattern: "finance.*",
    check: (expected, actual) => {
      if (!("amount" in expected) || !("amount" in actual)) {
        return { passed: true, message: "No amount to verify — skipped", severity: "info" };
      }
      const expectedAmt = Number(expected.amount);
      const actualAmt = Number(actual.amount);
      const tolerance = expectedAmt * 0.01; // 1% tolerance
      const matched = Math.abs(expectedAmt - actualAmt) <= tolerance;
      return {
        passed: matched,
        message: matched ? `Amount matches: ${actualAmt}` : `Amount mismatch: expected ${expectedAmt}, got ${actualAmt}`,
        details: { expected: expectedAmt, actual: actualAmt, tolerance },
        severity: matched ? "info" : "critical",
      };
    },
  },
  {
    id: "entity-id-present",
    name: "Entity ID returned",
    description: "Mutations should return the affected entity ID",
    capabilityPattern: "*.create,*.update,*.delete",
    check: (_expected, actual) => {
      const hasId = "id" in actual || "entityId" in actual || "recordId" in actual;
      return {
        passed: hasId,
        message: hasId ? "Entity ID present in result" : "No entity ID in result — may indicate incomplete execution",
        severity: hasId ? "info" : "warning",
      };
    },
  },
];

export class VerificationEngine {
  private rules: VerificationRule[];
  private results: VerificationResult[] = [];
  private maxResults = 2000;

  constructor(additionalRules?: VerificationRule[]) {
    this.rules = [...BUILTIN_RULES, ...(additionalRules ?? [])];
  }

  /** Verify execution result against expected postconditions */
  verify(
    correlationId: string,
    capabilityId: string,
    envelopeId: string,
    expected: Record<string, unknown>,
    actual: Record<string, unknown>
  ): VerificationResult {
    const startTime = performance.now();

    const applicableRules = this.rules.filter(rule =>
      this.matchesPattern(capabilityId, rule.capabilityPattern)
    );

    const checks = applicableRules.map(rule => ({
      ruleId: rule.id,
      ruleName: rule.name,
      result: rule.check(expected, actual),
    }));

    const passed = checks.every(c => c.result.passed);
    const severities = checks.map(c => c.result.severity ?? "info");
    const overallSeverity = severities.includes("critical") ? "critical"
      : severities.includes("error") ? "error"
      : severities.includes("warning") ? "warning" : "info";

    const rollbackRecommended = overallSeverity === "critical";
    const criticalFailures = checks.filter(c => c.result.severity === "critical" && !c.result.passed);
    const rollbackReason = rollbackRecommended && criticalFailures.length > 0
      ? `Critical verification failure: ${criticalFailures.map(c => c.result.message).join("; ")}`
      : undefined;

    const result: VerificationResult = {
      id: crypto.randomUUID(),
      correlationId,
      capabilityId,
      envelopeId,
      timestamp: Date.now(),
      passed,
      checks,
      overallSeverity,
      rollbackRecommended,
      rollbackReason,
      durationMs: Math.round(performance.now() - startTime),
    };

    this.results.push(result);
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }

    return result;
  }

  /** Add a custom verification rule */
  addRule(rule: VerificationRule): void {
    this.rules.push(rule);
  }

  /** Get verification history */
  getHistory(options?: { correlationId?: string; capabilityId?: string; passedOnly?: boolean; limit?: number }): VerificationResult[] {
    let results = [...this.results];
    if (options?.correlationId) results = results.filter(r => r.correlationId === options.correlationId);
    if (options?.capabilityId) results = results.filter(r => r.capabilityId === options.capabilityId);
    if (options?.passedOnly !== undefined) results = results.filter(r => r.passed === options.passedOnly);
    results.sort((a, b) => b.timestamp - a.timestamp);
    return options?.limit ? results.slice(0, options.limit) : results;
  }

  /** Get verification stats */
  getStats(): { total: number; passed: number; failed: number; rollbacksRecommended: number; avgDurationMs: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const rollbacksRecommended = this.results.filter(r => r.rollbackRecommended).length;
    const avgDurationMs = total > 0 ? Math.round(this.results.reduce((s, r) => s + r.durationMs, 0) / total) : 0;
    return { total, passed, failed: total - passed, rollbacksRecommended, avgDurationMs };
  }

  // ── Private ───────────────────────────────────────────────────

  private matchesPattern(capabilityId: string, pattern: string): boolean {
    if (pattern === "*") return true;
    if (pattern.includes(",")) {
      return pattern.split(",").some(p => this.matchesPattern(capabilityId, p.trim()));
    }
    if (pattern.endsWith("*")) {
      return capabilityId.startsWith(pattern.slice(0, -1));
    }
    return capabilityId === pattern;
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createVerificationEngine(additionalRules?: VerificationRule[]): VerificationEngine {
  return new VerificationEngine(additionalRules);
}
