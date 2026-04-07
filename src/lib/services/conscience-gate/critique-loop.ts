// ═══════════════════════════════════════════════════════════════
// SITA OS — CritiqueLoop
// Post-inference validation pattern feeding back to ConscienceGate
// ═══════════════════════════════════════════════════════════════

import { getTaskContract, type TaskContract } from "@/lib/contracts/global-contracts-registry";

// ── Critique Types ─────────────────────────────────────────────

export type CritiqueRecommendation = "accept" | "caveat" | "reject" | "retry";

export interface CritiqueIssue {
  check: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  field?: string;
}

export interface CritiqueResult {
  passed: boolean;
  recommendation: CritiqueRecommendation;
  issues: CritiqueIssue[];
  confidenceAdjustment: number; // -1 to +1 delta
  groundednessScore: number; // 0 to 1
  determinismVerified: boolean;
  completenessScore: number; // 0 to 1
  taskType: string;
  timestamp: string;
  durationMs: number;
}

// ── Evidence Source ────────────────────────────────────────────

export interface EvidenceSource {
  id: string;
  type: string;
  content: string;
  confidence: number;
}

// ── Critique Functions ─────────────────────────────────────────

export function runCritique(
  output: Record<string, unknown>,
  taskType: string,
  evidence: EvidenceSource[] = []
): CritiqueResult {
  const start = Date.now();
  const contract = getTaskContract(taskType);
  const issues: CritiqueIssue[] = [];

  if (!contract) {
    return {
      passed: false,
      recommendation: "reject",
      issues: [{ check: "contract-lookup", severity: "critical", message: `Unknown task type: ${taskType}` }],
      confidenceAdjustment: -1,
      groundednessScore: 0,
      determinismVerified: false,
      completenessScore: 0,
      taskType,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - start,
    };
  }

  // 1. Completeness check
  const completenessResult = verifyCompleteness(output, contract);
  issues.push(...completenessResult.issues);

  // 2. Groundedness check
  const groundednessResult = verifyGroundedness(output, evidence, contract);
  issues.push(...groundednessResult.issues);

  // 3. Determinism check
  const determinismResult = verifyDeterminism(output, contract);
  issues.push(...determinismResult.issues);

  // Calculate recommendation
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let recommendation: CritiqueRecommendation = "accept";
  let confidenceAdjustment = 0;

  if (criticalCount > 0) {
    recommendation = "reject";
    confidenceAdjustment = -0.5;
  } else if (errorCount > 0) {
    recommendation = "retry";
    confidenceAdjustment = -0.3;
  } else if (warningCount > 0) {
    recommendation = "caveat";
    confidenceAdjustment = -0.1;
  } else {
    confidenceAdjustment = 0.05;
  }

  return {
    passed: recommendation === "accept" || recommendation === "caveat",
    recommendation,
    issues,
    confidenceAdjustment,
    groundednessScore: groundednessResult.score,
    determinismVerified: determinismResult.verified,
    completenessScore: completenessResult.score,
    taskType,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - start,
  };
}

// ── Verification Sub-Functions ─────────────────────────────────

function verifyCompleteness(output: Record<string, unknown>, contract: TaskContract): { score: number; issues: CritiqueIssue[] } {
  const issues: CritiqueIssue[] = [];
  const requiredFields = contract.outputSchema.requiredFields || [];

  if (requiredFields.length === 0) return { score: 1, issues };

  let present = 0;
  for (const field of requiredFields) {
    if (field in output && output[field] !== undefined && output[field] !== null && output[field] !== "") {
      present++;
    } else {
      issues.push({
        check: "completeness",
        severity: "error",
        message: `Missing required output field: ${field}`,
        field,
      });
    }
  }

  return { score: requiredFields.length > 0 ? present / requiredFields.length : 1, issues };
}

function verifyGroundedness(
  output: Record<string, unknown>,
  evidence: EvidenceSource[],
  contract: TaskContract
): { score: number; issues: CritiqueIssue[] } {
  const issues: CritiqueIssue[] = [];

  if (!contract.evidenceRequirements.requiresEvidence) return { score: 1, issues };

  if (evidence.length === 0) {
    issues.push({
      check: "groundedness",
      severity: contract.riskTier === "critical" ? "critical" : "warning",
      message: "No evidence sources provided for evidence-required task",
    });
    return { score: 0, issues };
  }

  const minSources = contract.evidenceRequirements.minSources || 1;
  if (evidence.length < minSources) {
    issues.push({
      check: "groundedness",
      severity: "warning",
      message: `Insufficient evidence sources: ${evidence.length}/${minSources}`,
    });
  }

  // Check if output references evidence (basic heuristic)
  const outputStr = JSON.stringify(output).toLowerCase();
  let groundedCount = 0;
  for (const src of evidence) {
    const keywords = src.content.toLowerCase().split(/\s+/).filter((w) => w.length > 5).slice(0, 10);
    const matched = keywords.some((kw) => outputStr.includes(kw));
    if (matched) groundedCount++;
  }

  const score = evidence.length > 0 ? groundedCount / evidence.length : 0;
  if (score < 0.5 && contract.evidenceRequirements.requiresCitation) {
    issues.push({
      check: "groundedness",
      severity: "warning",
      message: `Low groundedness score: ${(score * 100).toFixed(0)}% — output may not reflect evidence`,
    });
  }

  return { score, issues };
}

function verifyDeterminism(output: Record<string, unknown>, contract: TaskContract): { verified: boolean; issues: CritiqueIssue[] } {
  const issues: CritiqueIssue[] = [];

  if (!contract.requiresDeterministicVerification) return { verified: true, issues };

  // Check that numeric outputs have proof/formula fields
  if (contract.outputSchema.format === "numeric") {
    if (!("proof" in output) && !("formula" in output)) {
      issues.push({
        check: "determinism",
        severity: "critical",
        message: "Deterministic task missing proof/formula in output",
      });
      return { verified: false, issues };
    }

    if ("result" in output && typeof output.result === "number" && isNaN(output.result)) {
      issues.push({
        check: "determinism",
        severity: "critical",
        message: "Deterministic result is NaN",
      });
      return { verified: false, issues };
    }
  }

  // Check validation rules
  const rules = contract.outputSchema.validationRules || [];
  for (const rule of rules) {
    if (rule === "deterministic-match" && !("proof" in output)) {
      issues.push({
        check: "determinism",
        severity: "error",
        message: "Validation rule 'deterministic-match' requires proof field",
      });
    }
    if (rule === "regime-valid" && !("regime" in output)) {
      issues.push({
        check: "determinism",
        severity: "error",
        message: "Validation rule 'regime-valid' requires regime field",
      });
    }
  }

  return { verified: issues.filter((i) => i.severity === "critical").length === 0, issues };
}

// ── Critique Log ───────────────────────────────────────────────

const critiqueLog: CritiqueResult[] = [];

export function logCritique(result: CritiqueResult): void {
  critiqueLog.push(result);
  if (critiqueLog.length > 500) critiqueLog.splice(0, critiqueLog.length - 250);
}

export function getCritiqueLog(limit?: number): CritiqueResult[] {
  const log = [...critiqueLog].reverse();
  return limit ? log.slice(0, limit) : log;
}

export function getCritiqueStats(): { total: number; passed: number; failed: number; accept: number; caveat: number; reject: number; retry: number; avgGroundedness: number; avgCompleteness: number } {
  const stats = { total: critiqueLog.length, passed: 0, failed: 0, accept: 0, caveat: 0, reject: 0, retry: 0, avgGroundedness: 0, avgCompleteness: 0 };
  let gSum = 0;
  let cSum = 0;
  for (const r of critiqueLog) {
    if (r.passed) stats.passed++;
    else stats.failed++;
    stats[r.recommendation]++;
    gSum += r.groundednessScore;
    cSum += r.completenessScore;
  }
  if (stats.total > 0) {
    stats.avgGroundedness = gSum / stats.total;
    stats.avgCompleteness = cSum / stats.total;
  }
  return stats;
}

