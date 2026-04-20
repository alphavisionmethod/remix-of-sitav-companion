// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Runtime Context Types
// Unified typed context combining all governance contracts.
// ═══════════════════════════════════════════════════════════════

import type { AdvisorIdentity } from "@/lib/advisors/advisor-identity-registry";
import type { PersonaBoundary } from "@/lib/advisors/advisor-persona-boundary-map";
import type { ConfidenceGate } from "@/lib/advisors/advisor-confidence-policy";
import type { DisablementPolicy } from "@/lib/advisors/advisor-disablement-policy";
import type { MemoryAgingRule } from "@/lib/advisors/advisor-memory-aging-policy";
import type { OverrideAction } from "@/lib/advisors/advisor-override-model";
import type { PermissionEntry } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
import type { EscalationRule } from "@/lib/ai-platform/runtime/advisor-escalation-policy";
import type { ReversibilityEntry } from "@/lib/ai-platform/runtime/advisor-reversibility-map";

export interface AdvisorRuntimeContext {
  readonly advisorId: string;
  readonly identity: AdvisorIdentity | null;
  readonly personaBoundary: PersonaBoundary | null;
  readonly permissions: PermissionEntry | null;
  readonly confidenceGates: readonly ConfidenceGate[];
  readonly escalationRules: readonly EscalationRule[];
  readonly reversibilityMap: readonly ReversibilityEntry[];
  readonly memoryAgingRules: readonly MemoryAgingRule[];
  readonly overrideActions: readonly OverrideAction[];
  readonly disablementPolicies: readonly DisablementPolicy[];
}