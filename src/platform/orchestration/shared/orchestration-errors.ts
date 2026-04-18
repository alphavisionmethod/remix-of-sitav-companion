// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Errors
// Typed error hierarchy for each orchestration layer
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationLayer } from "./orchestration-types";

export class OrchestrationError extends Error {
  constructor(
    public readonly layer: OrchestrationLayer,
    public readonly code: string,
    message: string,
    public readonly recoverable: boolean = false,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "OrchestrationError";
  }
}

// Intent layer errors
export class IntentParsingError extends OrchestrationError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super("intent", "INTENT_PARSE_FAILED", message, true, metadata);
    this.name = "IntentParsingError";
  }
}

export class IntentClassificationError extends OrchestrationError {
  constructor(message: string) {
    super("intent", "INTENT_CLASSIFICATION_FAILED", message, true);
    this.name = "IntentClassificationError";
  }
}

export class EscalationError extends OrchestrationError {
  constructor(message: string) {
    super("intent", "ESCALATION_FAILED", message, false);
    this.name = "EscalationError";
  }
}

// Planning layer errors
export class PlanConstructionError extends OrchestrationError {
  constructor(message: string) {
    super("planning", "PLAN_CONSTRUCTION_FAILED", message, true);
    this.name = "PlanConstructionError";
  }
}

export class DependencyResolutionError extends OrchestrationError {
  constructor(message: string, public readonly unresolvedDeps: string[]) {
    super("planning", "DEPENDENCY_RESOLUTION_FAILED", message, false, { unresolvedDeps });
    this.name = "DependencyResolutionError";
  }
}

export class ApprovalDeniedError extends OrchestrationError {
  constructor(reason: string, public readonly policyId?: string) {
    super("planning", "APPROVAL_DENIED", reason, false, { policyId });
    this.name = "ApprovalDeniedError";
  }
}

// Execution layer errors
export class ExecutionFailedError extends OrchestrationError {
  constructor(message: string, public readonly stepId?: string) {
    super("execution", "EXECUTION_FAILED", message, true, { stepId });
    this.name = "ExecutionFailedError";
  }
}

export class ConnectorError extends OrchestrationError {
  constructor(connectorId: string, message: string) {
    super("execution", "CONNECTOR_ERROR", message, true, { connectorId });
    this.name = "ConnectorError";
  }
}

export class RollbackError extends OrchestrationError {
  constructor(message: string, public readonly originalExecutionId: string) {
    super("execution", "ROLLBACK_FAILED", message, false, { originalExecutionId });
    this.name = "RollbackError";
  }
}

export class RetryExhaustedError extends OrchestrationError {
  constructor(message: string, public readonly attempts: number) {
    super("execution", "RETRY_EXHAUSTED", message, false, { attempts });
    this.name = "RetryExhaustedError";
  }
}

// Proof layer errors
export class ReceiptCreationError extends OrchestrationError {
  constructor(message: string) {
    super("proof", "RECEIPT_CREATION_FAILED", message, true);
    this.name = "ReceiptCreationError";
  }
}

export class ProofIntegrityError extends OrchestrationError {
  constructor(message: string, public readonly expectedHash?: string) {
    super("proof", "PROOF_INTEGRITY_VIOLATION", message, false, { expectedHash });
    this.name = "ProofIntegrityError";
  }
}

// Policy errors (cross-layer)
export class PolicyViolationError extends OrchestrationError {
  constructor(layer: OrchestrationLayer, policyId: string, message: string) {
    super(layer, "POLICY_VIOLATION", message, false, { policyId });
    this.name = "PolicyViolationError";
  }
}

export class BudgetExceededError extends OrchestrationError {
  constructor(layer: OrchestrationLayer, budgetType: string, limit: number) {
    super(layer, "BUDGET_EXCEEDED", `${budgetType} budget exceeded (limit: ${limit})`, false, { budgetType, limit });
    this.name = "BudgetExceededError";
  }
}
