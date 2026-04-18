// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Contract System
// Every action needs a capability contract. No freeform execution.
// ═══════════════════════════════════════════════════════════════

export type CapabilityRiskClass = "informational" | "low" | "medium" | "high" | "irreversible" | "regulated";

export type ApprovalRequirement =
  | "none"
  | "single-approval"
  | "dual-approval"
  | "owner-only"
  | "multi-party"
  | "risk-tiered";      // dynamically determined by policy

export interface CapabilityContract {
  capabilityId: string;
  name: string;
  description: string;
  domain: "finance-os" | "business-os" | "concierge-os" | "platform";
  version: number;

  // Inputs
  requiredInputs: CapabilityInput[];
  optionalInputs: CapabilityInput[];
  requiredContext: string[];        // e.g., ["tenantId", "userId", "deviceTrust"]

  // Risk & Approval
  riskClass: CapabilityRiskClass;
  approvalRequirement: ApprovalRequirement;
  financialThreshold?: number;      // cents — above this, escalate approval
  requiresDeviceTrust: boolean;
  requiresIdentityAssurance: "basic" | "elevated" | "strong";

  // Policy & Evidence
  policyRulesRequired: string[];    // policy rule IDs that must pass
  evidenceRequirements: EvidenceRequirement[];
  minimumEvidenceGrade: "claimed" | "inferred" | "observed" | "attested" | "verified";

  // Connector Binding
  connectorBindings: ConnectorBinding[];

  // Execution
  expectedReceipts: string[];       // receipt types produced
  retrySemantics: RetryConfig;
  rollbackSemantics: RollbackConfig;
  compensationAvailable: boolean;
  idempotent: boolean;

  // Budget
  budgetProfile: BudgetProfile;

  // Metadata
  createdAt: string;
  updatedAt: string;
  deprecated: boolean;
  supersededBy?: string;
}

export interface CapabilityInput {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "date";
  description: string;
  validation?: string;    // validation rule description
  sensitive?: boolean;    // PII or financial data
}

export interface EvidenceRequirement {
  type: string;           // e.g., "account-balance-verified", "identity-confirmed"
  minimumGrade: "claimed" | "inferred" | "observed" | "attested" | "verified";
  maxAgeMs: number;       // evidence must be this fresh
}

export interface ConnectorBinding {
  connectorId: string;
  requiredPermissions: string[];
  environmentRestriction?: "production" | "staging" | "any";
  rateLimitOverride?: number;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffType: "none" | "linear" | "exponential";
  backoffBaseMs: number;
  retryableErrors: string[];
}

export interface RollbackConfig {
  rollbackAvailable: boolean;
  rollbackWindowMs?: number;
  rollbackRequiresApproval: boolean;
  rollbackCapabilityId?: string;    // capability to execute for rollback
}

export interface BudgetProfile {
  estimatedTokens: number;
  estimatedCostCents: number;
  budgetCategory: "standard" | "elevated" | "premium";
  hardLimitCents?: number;
}

// ── Approval Tier Resolution ────────────────────────────────

export interface ApprovalTierInput {
  riskClass: CapabilityRiskClass;
  amountCents?: number;
  financialThreshold?: number;
  deviceTrusted: boolean;
  identityAssurance: "basic" | "elevated" | "strong";
  anomalyScore?: number;          // 0-1
  priorPatternMatch?: boolean;    // user has done this before
}

export type ResolvedApprovalTier =
  | "auto-approved"
  | "single-approval"
  | "dual-approval"
  | "owner-only"
  | "multi-party"
  | "blocked";

export function resolveApprovalTier(input: ApprovalTierInput): ResolvedApprovalTier {
  // Irreversible or regulated always requires owner/multi-party
  if (input.riskClass === "irreversible") return "owner-only";
  if (input.riskClass === "regulated") return "multi-party";

  // Financial threshold escalation
  if (input.amountCents && input.financialThreshold && input.amountCents > input.financialThreshold) {
    return input.amountCents > input.financialThreshold * 5 ? "multi-party" : "dual-approval";
  }

  // Anomaly detected
  if (input.anomalyScore && input.anomalyScore > 0.7) return "dual-approval";
  if (input.anomalyScore && input.anomalyScore > 0.4) return "single-approval";

  // Untrusted device escalation
  if (!input.deviceTrusted && input.riskClass !== "informational") return "single-approval";

  // Low identity assurance escalation
  if (input.identityAssurance === "basic" && input.riskClass === "high") return "dual-approval";

  // Standard risk resolution
  if (input.riskClass === "high") return "single-approval";
  if (input.riskClass === "medium") return input.priorPatternMatch ? "auto-approved" : "single-approval";
  if (input.riskClass === "low") return "auto-approved";
  return "auto-approved"; // informational
}

// ── Contract Validation ─────────────────────────────────────

export function validateCapabilityContract(contract: CapabilityContract): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!contract.capabilityId) errors.push("Missing capabilityId");
  if (!contract.name) errors.push("Missing name");
  if (contract.requiredInputs.length === 0 && contract.requiredContext.length === 0) {
    errors.push("Capability must declare at least one required input or context");
  }
  if (contract.riskClass === "irreversible" && contract.rollbackSemantics.rollbackAvailable) {
    errors.push("Irreversible capability cannot declare rollback as available");
  }
  if (contract.connectorBindings.length > 0 && !contract.idempotent) {
    errors.push("Capabilities with connector bindings should be idempotent");
  }
  if (contract.expectedReceipts.length === 0) {
    errors.push("Every capability must produce at least one receipt type");
  }
  return { valid: errors.length === 0, errors };
}
