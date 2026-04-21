// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Operator Confirmation (Wave 21)
// Confirmation contracts for sensitive recovery steps.
// ═══════════════════════════════════════════════════════════════

import type { StepSafetyLevel } from "./runbook-execution-contract";

export interface ConfirmationRequirement {
  readonly safetyLevel: StepSafetyLevel;
  readonly requiresConfirmation: boolean;
  readonly requiredRoles: readonly string[];
  readonly dualControlRequired: boolean;
  readonly timeoutMs: number;
  readonly rationaleRequired: boolean;
  readonly escalationOnTimeout: string;
}

export const CONFIRMATION_POLICY: Record<StepSafetyLevel, ConfirmationRequirement> = {
  safe: {
    safetyLevel: "safe",
    requiresConfirmation: false,
    requiredRoles: [],
    dualControlRequired: false,
    timeoutMs: 0,
    rationaleRequired: false,
    escalationOnTimeout: "none",
  },
  "requires-confirmation": {
    safetyLevel: "requires-confirmation",
    requiresConfirmation: true,
    requiredRoles: ["admin", "operator"],
    dualControlRequired: false,
    timeoutMs: 300_000,
    rationaleRequired: true,
    escalationOnTimeout: "Escalate to platform-admin after 5 min timeout",
  },
  destructive: {
    safetyLevel: "destructive",
    requiresConfirmation: true,
    requiredRoles: ["admin"],
    dualControlRequired: true,
    timeoutMs: 600_000,
    rationaleRequired: true,
    escalationOnTimeout: "Escalate to platform-admin + incident-commander after 10 min timeout",
  },
  irreversible: {
    safetyLevel: "irreversible",
    requiresConfirmation: true,
    requiredRoles: ["admin"],
    dualControlRequired: true,
    timeoutMs: 900_000,
    rationaleRequired: true,
    escalationOnTimeout: "Abort recovery and escalate to incident-commander after 15 min timeout",
  },
};

export interface ConfirmationRecord {
  readonly stepId: string;
  readonly confirmedBy: string;
  readonly confirmedAt: string;
  readonly rationale: string;
  readonly dualApprover: string | null;
  readonly safetyLevel: StepSafetyLevel;
}

export function getConfirmationRequirement(safetyLevel: StepSafetyLevel): ConfirmationRequirement {
  return CONFIRMATION_POLICY[safetyLevel];
}

export function requiresConfirmation(safetyLevel: StepSafetyLevel): boolean {
  return CONFIRMATION_POLICY[safetyLevel].requiresConfirmation;
}

export function requiresDualControl(safetyLevel: StepSafetyLevel): boolean {
  return CONFIRMATION_POLICY[safetyLevel].dualControlRequired;
}