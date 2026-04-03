// ═══════════════════════════════════════════════════════════════
// SITA OS — Verification Service
// Compares expected vs actual outcomes using VerificationRecord
// ═══════════════════════════════════════════════════════════════

import type { VerificationRecord } from "@/packages/contracts";

const verificationLog: VerificationRecord[] = [];

export function verify(params: {
  actionId: string;
  expected: Record<string, unknown>;
  actual: Record<string, unknown>;
}): VerificationRecord {
  const discrepancies = findDiscrepancies(params.expected, params.actual);
  const match = discrepancies.length === 0;

  const record: VerificationRecord = {
    id: crypto.randomUUID(),
    actionId: params.actionId,
    expected: params.expected,
    actual: params.actual,
    match,
    discrepancies,
    recommendation: match ? "accept" : discrepancies.length >= 3 ? "rollback" : "review",
    timestamp: new Date().toISOString(),
  };

  verificationLog.push(record);
  return record;
}

function findDiscrepancies(expected: Record<string, unknown>, actual: Record<string, unknown>): string[] {
  const issues: string[] = [];
  for (const key of Object.keys(expected)) {
    if (!(key in actual)) {
      issues.push(`Missing field: ${key}`);
    } else if (JSON.stringify(expected[key]) !== JSON.stringify(actual[key])) {
      issues.push(`Mismatch on "${key}": expected ${JSON.stringify(expected[key])}, got ${JSON.stringify(actual[key])}`);
    }
  }
  for (const key of Object.keys(actual)) {
    if (!(key in expected)) {
      issues.push(`Unexpected field: ${key}`);
    }
  }
  return issues;
}

export function getVerificationHistory(actionId?: string): VerificationRecord[] {
  return actionId
    ? verificationLog.filter((r) => r.actionId === actionId)
    : [...verificationLog];
}

export function getVerificationStats(): { total: number; matched: number; mismatched: number; rollbackRecommended: number } {
  return {
    total: verificationLog.length,
    matched: verificationLog.filter((r) => r.match).length,
    mismatched: verificationLog.filter((r) => !r.match).length,
    rollbackRecommended: verificationLog.filter((r) => r.recommendation === "rollback").length,
  };
}
