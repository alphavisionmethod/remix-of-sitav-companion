// ═══════════════════════════════════════════════════════════════
// SITA OS — Contract Runtime Consumer
// Bridges ecosystem contract types to actual runtime execution
// Makes contract definitions operational, not just type declarations
// ═══════════════════════════════════════════════════════════════

import {
  type CapabilityContract,
  type ApprovalTierInput,
  resolveApprovalTier,
  validateCapabilityContract,
} from "@/lib/architecture/capability-contract-system";

import { ADVISOR_CONTRACTS } from "@/lib/no-hallucination/advisor-contract";

import { logOsEvent, logAuditEvent, recordReceipt } from "./data-flow-bridge";

// ── Contract Registry (runtime) ─────────────────────────────
const activeContracts = new Map<string, CapabilityContract>();

export function registerContract(contract: CapabilityContract): { registered: boolean; errors: string[] } {
  const validation = validateCapabilityContract(contract);
  if (!validation.valid) {
    console.warn(`[contract-consumer] Rejected contract ${contract.capabilityId}:`, validation.errors);
    return { registered: false, errors: validation.errors };
  }
  activeContracts.set(contract.capabilityId, contract);
  return { registered: true, errors: [] };
}

export function getContract(capabilityId: string): CapabilityContract | undefined {
  return activeContracts.get(capabilityId);
}

export function listContracts(): CapabilityContract[] {
  return [...activeContracts.values()];
}

// ── Contract-Governed Execution ─────────────────────────────
export interface ExecutionRequest {
  capabilityId: string;
  inputs: Record<string, unknown>;
  context: Record<string, unknown>;
  deviceTrusted: boolean;
  identityAssurance: "basic" | "elevated" | "strong";
}

export interface ExecutionDecision {
  allowed: boolean;
  approvalTier: string;
  reason: string;
  budgetEstimateCents: number;
  requiredEvidenceGrades: string[];
}

export function evaluateExecution(request: ExecutionRequest): ExecutionDecision {
  const contract = activeContracts.get(request.capabilityId);
  if (!contract) {
    return { allowed: false, approvalTier: "blocked", reason: "No contract registered", budgetEstimateCents: 0, requiredEvidenceGrades: [] };
  }

  // Check required inputs
  const missingInputs = contract.requiredInputs.filter(i => !(i.name in request.inputs));
  if (missingInputs.length > 0) {
    return { allowed: false, approvalTier: "blocked", reason: `Missing inputs: ${missingInputs.map(i => i.name).join(", ")}`, budgetEstimateCents: 0, requiredEvidenceGrades: [] };
  }

  // Check required context
  const missingContext = contract.requiredContext.filter(c => !(c in request.context));
  if (missingContext.length > 0) {
    return { allowed: false, approvalTier: "blocked", reason: `Missing context: ${missingContext.join(", ")}`, budgetEstimateCents: 0, requiredEvidenceGrades: [] };
  }

  // Resolve approval tier
  const tierInput: ApprovalTierInput = {
    riskClass: contract.riskClass,
    amountCents: request.inputs.amountCents as number | undefined,
    financialThreshold: contract.financialThreshold,
    deviceTrusted: request.deviceTrusted,
    identityAssurance: request.identityAssurance,
  };
  const approvalTier = resolveApprovalTier(tierInput);

  // Log the evaluation
  logOsEvent("contract_evaluation", "contract_runtime", {
    capabilityId: request.capabilityId,
    approvalTier,
    riskClass: contract.riskClass,
  }).catch(() => {});

  return {
    allowed: approvalTier !== "blocked",
    approvalTier,
    reason: `Contract ${contract.name}: ${approvalTier}`,
    budgetEstimateCents: contract.budgetProfile.estimatedCostCents,
    requiredEvidenceGrades: contract.evidenceRequirements.map(e => e.minimumGrade),
  };
}

// ── Advisor Contract Consumer ───────────────────────────────
export function getAdvisorGrounding(advisorId: string) {
  return ADVISOR_CONTRACTS[advisorId] ?? null;
}

export function validateAdvisorInputs(advisorId: string, availableInputs: string[]): {
  ready: boolean;
  missingRequired: string[];
  missingOptional: string[];
} {
  const contract = ADVISOR_CONTRACTS[advisorId];
  if (!contract) return { ready: false, missingRequired: ["unknown_advisor"], missingOptional: [] };

  const missingRequired = contract.requiredInputs.filter(i => !availableInputs.includes(i));
  const missingOptional = contract.optionalInputs.filter(i => !availableInputs.includes(i));

  return { ready: missingRequired.length === 0, missingRequired, missingOptional };
}

export function checkAdvisorActionAllowed(advisorId: string, action: string, dataFreshness: Record<string, number>): {
  allowed: boolean;
  reason: string;
} {
  const contract = ADVISOR_CONTRACTS[advisorId];
  if (!contract) return { allowed: false, reason: "No advisor contract found" };

  if (contract.blockedActionsWhenStale.includes(action)) {
    // Check if any required data is stale (>4h = 14400000ms)
    const staleInputs = contract.requiredInputs.filter(input => {
      const age = dataFreshness[input];
      return age === undefined || age > 14400000;
    });
    if (staleInputs.length > 0) {
      return { allowed: false, reason: `Blocked: stale data for ${staleInputs.join(", ")}` };
    }
  }

  return { allowed: true, reason: "All grounding checks passed" };
}

// ── Execution with receipts ─────────────────────────────────
export async function executeWithContract(
  request: ExecutionRequest,
  executor: () => Promise<Record<string, unknown>>,
): Promise<{ success: boolean; result?: Record<string, unknown>; decision: ExecutionDecision }> {
  const decision = evaluateExecution(request);

  if (!decision.allowed) {
    await logAuditEvent("execution_blocked", "contract_runtime", "capability", request.capabilityId, "high", { reason: decision.reason });
    return { success: false, decision };
  }

  if (decision.approvalTier !== "auto-approved") {
    await logAuditEvent("execution_needs_approval", "contract_runtime", "capability", request.capabilityId, "medium", { approvalTier: decision.approvalTier });
    return { success: false, decision: { ...decision, reason: `Requires ${decision.approvalTier}` } };
  }

  try {
    const result = await executor();
    await recordReceipt("capability_execution", request.capabilityId, { inputs: request.inputs, result, approvalTier: decision.approvalTier });
    return { success: true, result, decision };
  } catch (error: any) {
    await logAuditEvent("execution_failed", "contract_runtime", "capability", request.capabilityId, "high", { error: error.message });
    return { success: false, decision: { ...decision, reason: `Execution failed: ${error.message}` } };
  }
}
