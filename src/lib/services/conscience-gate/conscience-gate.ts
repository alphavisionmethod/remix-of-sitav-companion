// ═══════════════════════════════════════════════════════════════
// SITA OS — ConscienceGate
// Canonical pre-response policy, safety, and validation boundary
// Replaces and elevates groundedness-gate
// ═══════════════════════════════════════════════════════════════

import type { RiskTier } from "@/packages/contracts/_contract-scaffold";
import { getTaskContract, validateTaskInput, type TaskContract, type BudgetClass } from "@/lib/contracts/global-contracts-registry";

// ── Gate Verdict Types ─────────────────────────────────────────

export type GateDecision = "pass" | "caveat" | "block" | "refuse";

export interface EvidenceState {
  sufficient: boolean;
  sourcesAvailable: number;
  sourcesRequired: number;
  missingTypes: string[];
}

export interface BudgetState {
  allowed: boolean;
  estimatedCostCents: number;
  budgetClass: BudgetClass;
  remainingBudgetCents: number;
  shouldDowngrade: boolean;
}

export interface RoutingHints {
  preferredProvider?: string;
  preferredModel?: string;
  maxLatencyMs: number;
  routingClass: string;
  deterministicPath: boolean;
}

export interface GateVerdict {
  decision: GateDecision;
  taskType: string;
  riskClass: RiskTier;
  evidenceState: EvidenceState;
  budgetState: BudgetState;
  routingHints: RoutingHints;
  retrievalRequired: boolean;
  critiqueRequired: boolean;
  approvalRequired: boolean;
  deterministicRequired: boolean;
  reasons: string[];
  timestamp: string;
  correlationId: string;
}

// ── Gate Request ───────────────────────────────────────────────

export interface GateRequest {
  taskType: string;
  userId: string;
  tenantId: string;
  input: Record<string, unknown>;
  correlationId?: string;
  evidenceSources?: Array<{ type: string; id: string; freshness?: string }>;
  budgetContext?: { remainingCents: number; dailySpendCents: number; monthlySpendCents: number };
}

// ── ConscienceGateService ──────────────────────────────────────

export class ConscienceGateService {
  private verdictLog: GateVerdict[] = [];

  async evaluate(request: GateRequest): Promise<GateVerdict> {
    const correlationId = request.correlationId || crypto.randomUUID();
    const contract = getTaskContract(request.taskType);

    if (!contract) {
      return this.buildVerdict("refuse", request.taskType, "standard", correlationId, {
        reasons: [`Unknown task type: ${request.taskType}. Not in Global Contracts Registry.`],
      });
    }

    const reasons: string[] = [];
    let decision: GateDecision = "pass";

    // 1. Input Validation
    const inputValidation = validateTaskInput(request.taskType, request.input);
    if (!inputValidation.valid) {
      decision = "block";
      if (inputValidation.missing.length > 0) reasons.push(`Missing required fields: ${inputValidation.missing.join(", ")}`);
      reasons.push(...inputValidation.errors);
    }

    // 2. Risk Classification
    const riskClass = contract.riskTier;
    if (riskClass === "critical") {
      reasons.push("Critical risk tier — enhanced validation active");
    }

    // 3. Evidence Requirements
    const evidenceState = this.checkEvidenceRequirements(contract, request.evidenceSources || []);
    if (!evidenceState.sufficient && contract.evidenceRequirements.requiresEvidence) {
      if (riskClass === "critical") {
        decision = decision === "pass" ? "block" : decision;
        reasons.push(`Insufficient evidence for critical task: ${evidenceState.sourcesAvailable}/${evidenceState.sourcesRequired} sources`);
      } else {
        decision = decision === "pass" ? "caveat" : decision;
        reasons.push(`Evidence incomplete: ${evidenceState.sourcesAvailable}/${evidenceState.sourcesRequired} sources — output will carry caveat`);
      }
    }

    // 4. Budget Policy
    const budgetState = this.checkBudgetPolicy(contract, request.budgetContext);
    if (!budgetState.allowed) {
      decision = "block";
      reasons.push(`Budget exceeded: estimated ${budgetState.estimatedCostCents}¢, remaining ${budgetState.remainingBudgetCents}¢`);
    } else if (budgetState.shouldDowngrade) {
      decision = decision === "pass" ? "caveat" : decision;
      reasons.push("Budget pressure — model downgrade recommended");
    }

    // 5. Retrieval Required
    const retrievalRequired = contract.requiresRetrieval;
    if (retrievalRequired) reasons.push("Retrieval context assembly required before inference");

    // 6. Deterministic Required
    const deterministicRequired = contract.requiresDeterministicVerification;
    if (deterministicRequired) reasons.push("Deterministic verification required — Math-OS path");

    // 7. Approval Required
    const approvalRequired = contract.requiresApproval;
    if (approvalRequired) reasons.push("Human approval required before execution");

    // 8. Critique Required
    const critiqueRequired = contract.requiresCritique;
    if (critiqueRequired) reasons.push("Post-inference critique loop required");

    // Build routing hints
    const routingHints: RoutingHints = {
      maxLatencyMs: contract.maxLatencyMs,
      routingClass: contract.routingClass,
      deterministicPath: deterministicRequired,
      preferredProvider: contract.allowedProviders[0],
      preferredModel: contract.allowedModels[0],
    };

    if (reasons.length === 0) reasons.push("All gate checks passed");

    const verdict = this.buildVerdict(decision, request.taskType, riskClass, correlationId, {
      evidenceState,
      budgetState,
      routingHints,
      retrievalRequired,
      critiqueRequired,
      approvalRequired,
      deterministicRequired,
      reasons,
    });

    this.verdictLog.push(verdict);
    if (this.verdictLog.length > 1000) this.verdictLog = this.verdictLog.slice(-500);

    return verdict;
  }

  private checkEvidenceRequirements(
    contract: TaskContract,
    sources: Array<{ type: string; id: string; freshness?: string }>
  ): EvidenceState {
    const req = contract.evidenceRequirements;
    if (!req.requiresEvidence) {
      return { sufficient: true, sourcesAvailable: sources.length, sourcesRequired: 0, missingTypes: [] };
    }

    const minSources = req.minSources || 1;
    const missingTypes: string[] = [];

    if (req.allowedSourceTypes) {
      const availableTypes = new Set(sources.map((s) => s.type));
      for (const t of req.allowedSourceTypes) {
        if (!availableTypes.has(t)) missingTypes.push(t);
      }
    }

    return {
      sufficient: sources.length >= minSources && missingTypes.length === 0,
      sourcesAvailable: sources.length,
      sourcesRequired: minSources,
      missingTypes,
    };
  }

  private checkBudgetPolicy(
    contract: TaskContract,
    budgetContext?: { remainingCents: number; dailySpendCents: number; monthlySpendCents: number }
  ): BudgetState {
    const estimatedCostCents = contract.maxCostCents;

    if (!budgetContext) {
      return { allowed: true, estimatedCostCents, budgetClass: contract.budgetClass, remainingBudgetCents: 9999, shouldDowngrade: false };
    }

    const allowed = budgetContext.remainingCents >= estimatedCostCents;
    const shouldDowngrade = budgetContext.remainingCents < estimatedCostCents * 3;

    return {
      allowed,
      estimatedCostCents,
      budgetClass: contract.budgetClass,
      remainingBudgetCents: budgetContext.remainingCents,
      shouldDowngrade,
    };
  }

  private buildVerdict(
    decision: GateDecision,
    taskType: string,
    riskClass: RiskTier,
    correlationId: string,
    overrides: Partial<GateVerdict>
  ): GateVerdict {
    return {
      decision,
      taskType,
      riskClass,
      evidenceState: { sufficient: true, sourcesAvailable: 0, sourcesRequired: 0, missingTypes: [] },
      budgetState: { allowed: true, estimatedCostCents: 0, budgetClass: "standard", remainingBudgetCents: 9999, shouldDowngrade: false },
      routingHints: { maxLatencyMs: 10000, routingClass: "balanced", deterministicPath: false },
      retrievalRequired: false,
      critiqueRequired: false,
      approvalRequired: false,
      deterministicRequired: false,
      reasons: [],
      timestamp: new Date().toISOString(),
      correlationId,
      ...overrides,
    };
  }

  getVerdictLog(limit?: number): GateVerdict[] {
    const log = [...this.verdictLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  getVerdictStats(): { total: number; pass: number; caveat: number; block: number; refuse: number } {
    const stats = { total: this.verdictLog.length, pass: 0, caveat: 0, block: 0, refuse: 0 };
    for (const v of this.verdictLog) stats[v.decision]++;
    return stats;
  }
}

export const conscienceGate = new ConscienceGateService();
