// ═══════════════════════════════════════════════════════════════
// SITA OS — useUnifiedPolicy hook (Phase 19.C)
// Client-side wrapper around resolveUnifiedPolicy()
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import {
  resolveUnifiedPolicy,
  type UnifiedPolicyQuery,
  type UnifiedPolicyDecision,
} from "@/lib/policy/unified-policy-matrix";

export function useUnifiedPolicy(query: UnifiedPolicyQuery): UnifiedPolicyDecision {
  return useMemo(() => resolveUnifiedPolicy(query), [
    query.actor,
    query.domain,
    query.surface,
    query.riskClass,
    query.deviceTrust,
    query.sensitivity,
    query.tenantScope,
    query.biometricStepUpRecent,
    query.hasJustification,
  ]);
}
