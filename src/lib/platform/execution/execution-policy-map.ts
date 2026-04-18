// ═══════════════════════════════════════════════════════════════
// SITA OS — Execution Policy Map
// Maps action classes to executors + applicable policies + kill switches.
// ═══════════════════════════════════════════════════════════════

import type { ActionClass } from "@/lib/platform/proof/proof-requirement-map";

export interface ExecutionPolicyBinding {
  readonly actionClass: ActionClass;
  readonly executorId: string;
  readonly applicablePolicies: readonly string[]; // policyIds from unified-policy-matrix
  readonly killSwitchTargets: readonly string[];
  readonly requiresPostconditionCheck: boolean;
  readonly maxRetries: number;
  readonly compensationStrategy: "automatic-rollback" | "manual-rollback" | "no-rollback" | "compensating-action";
  readonly notes: string;
}

export const EXECUTION_POLICY_MAP: readonly ExecutionPolicyBinding[] = [
  { actionClass: "files.upload",            executorId: "core.action-executor",  applicablePolicies: ["RLS-USER-ISOLATION"],                      killSwitchTargets: ["executor-kill"],            requiresPostconditionCheck: true,  maxRetries: 3, compensationStrategy: "automatic-rollback", notes: "Storage upload + metadata write" },
  { actionClass: "files.delete",            executorId: "core.action-executor",  applicablePolicies: ["RLS-USER-ISOLATION"],                      killSwitchTargets: ["executor-kill"],            requiresPostconditionCheck: true,  maxRetries: 1, compensationStrategy: "manual-rollback",    notes: "Soft-delete; hard delete in cleanup job" },
  { actionClass: "files.bulk-delete",       executorId: "core.workflow-runner",  applicablePolicies: ["RLS-USER-ISOLATION", "ADV-AUTO-CONFIDENCE"], killSwitchTargets: ["workflow-kill"],         requiresPostconditionCheck: true,  maxRetries: 1, compensationStrategy: "manual-rollback",    notes: "Approval-gated" },

  { actionClass: "finance.transfer",        executorId: "core.workflow-runner",  applicablePolicies: ["RLS-USER-ISOLATION", "ADV-AUTO-FINANCIAL"], killSwitchTargets: ["workflow-kill"],          requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "compensating-action", notes: "Always approval-gated; reversal via offsetting txn" },
  { actionClass: "finance.recategorize",    executorId: "core.action-executor",  applicablePolicies: ["RLS-USER-ISOLATION"],                      killSwitchTargets: ["executor-kill"],           requiresPostconditionCheck: true,  maxRetries: 3, compensationStrategy: "automatic-rollback", notes: "Reversible category change" },

  { actionClass: "comms.send-email",        executorId: "connector.runner",      applicablePolicies: ["ADV-AUTO-COMMS"],                          killSwitchTargets: ["connector-kill", "comms-kill"], requiresPostconditionCheck: false, maxRetries: 4, compensationStrategy: "no-rollback",      notes: "Cannot un-send email" },
  { actionClass: "comms.send-sms",          executorId: "connector.runner",      applicablePolicies: ["ADV-AUTO-COMMS"],                          killSwitchTargets: ["connector-kill", "comms-kill"], requiresPostconditionCheck: false, maxRetries: 4, compensationStrategy: "no-rollback",      notes: "Cannot un-send SMS" },

  { actionClass: "advisor.recommendation",  executorId: "advisor.action-runner", applicablePolicies: ["ADV-AUTO-CONFIDENCE", "AI-BUDGET-COST-LIMIT"], killSwitchTargets: ["advisor-kill", "ai-cost-kill"], requiresPostconditionCheck: true, maxRetries: 2, compensationStrategy: "no-rollback",     notes: "Generation only; no side effect" },
  { actionClass: "advisor.execute",         executorId: "advisor.action-runner", applicablePolicies: ["ADV-AUTO-FINANCIAL", "ADV-AUTO-COMMS", "ADV-AUTO-CONFIDENCE"], killSwitchTargets: ["advisor-kill"], requiresPostconditionCheck: true, maxRetries: 1, compensationStrategy: "compensating-action", notes: "Wired through approval gate" },

  { actionClass: "approval.approve",        executorId: "core.action-executor",  applicablePolicies: ["ADMIN-PERM-USER-MGMT"],                    killSwitchTargets: ["executor-kill"],            requiresPostconditionCheck: true,  maxRetries: 1, compensationStrategy: "manual-rollback",   notes: "Triggers downstream execution binding" },
  { actionClass: "approval.reject",         executorId: "core.action-executor",  applicablePolicies: [],                                          killSwitchTargets: ["executor-kill"],            requiresPostconditionCheck: false, maxRetries: 1, compensationStrategy: "no-rollback",       notes: "Decision recorded; no side effect" },

  { actionClass: "admin.kill-switch",       executorId: "system.kill-switch",    applicablePolicies: ["ADMIN-PERM-KILL-SWITCH", "OS-MFA-REQUIRED"], killSwitchTargets: ["self"],                  requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "manual-rollback",   notes: "Self-applies on kill" },
  { actionClass: "admin.config-change",     executorId: "core.action-executor",  applicablePolicies: ["ADMIN-PERM-USER-MGMT"],                    killSwitchTargets: ["executor-kill"],            requiresPostconditionCheck: true,  maxRetries: 1, compensationStrategy: "automatic-rollback", notes: "Versioned config; previous version restored" },

  { actionClass: "owner.transfer-control",  executorId: "system.kill-switch",    applicablePolicies: ["ADMIN-PERM-KILL-SWITCH", "OS-MFA-REQUIRED"], killSwitchTargets: ["self"],                  requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "manual-rollback",   notes: "Highest-trust operation" },

  { actionClass: "ai.inference",            executorId: "core.action-executor",  applicablePolicies: ["AI-BUDGET-TOKEN-LIMIT", "AI-BUDGET-COST-LIMIT", "AI-BUDGET-RATE-LIMIT"], killSwitchTargets: ["ai-cost-kill"], requiresPostconditionCheck: false, maxRetries: 2, compensationStrategy: "no-rollback", notes: "Inference receipts only" },
  { actionClass: "connector.exchange-token", executorId: "connector.runner",     applicablePolicies: ["RLS-SERVICE-ROLE"],                        killSwitchTargets: ["connector-kill"],           requiresPostconditionCheck: true,  maxRetries: 3, compensationStrategy: "manual-rollback",   notes: "Token rotation" },
  { actionClass: "shell.zone-transition",   executorId: "core.action-executor",  applicablePolicies: ["OS-TRUST-ZONE-BOUNDARY", "OS-MFA-REQUIRED"], killSwitchTargets: [],                       requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "no-rollback",       notes: "Read-only zone change" },

  { actionClass: "auth.signin",             executorId: "core.action-executor",  applicablePolicies: ["OS-MFA-REQUIRED"],                         killSwitchTargets: [],                           requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "no-rollback",       notes: "Session issuance" },
  { actionClass: "auth.signout",            executorId: "core.action-executor",  applicablePolicies: [],                                          killSwitchTargets: [],                           requiresPostconditionCheck: false, maxRetries: 0, compensationStrategy: "no-rollback",       notes: "Session revocation" },
  { actionClass: "auth.elevate",            executorId: "core.action-executor",  applicablePolicies: ["OS-MFA-REQUIRED"],                         killSwitchTargets: [],                           requiresPostconditionCheck: true,  maxRetries: 0, compensationStrategy: "no-rollback",       notes: "Elevated session" },
] as const;

export function getExecutionPolicy(actionClass: ActionClass): ExecutionPolicyBinding | undefined {
  return EXECUTION_POLICY_MAP.find((b) => b.actionClass === actionClass);
}

export function actionsForExecutor(executorId: string): readonly ExecutionPolicyBinding[] {
  return EXECUTION_POLICY_MAP.filter((b) => b.executorId === executorId);
}
