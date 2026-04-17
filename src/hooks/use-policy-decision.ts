// ═══════════════════════════════════════════════════════════════
// SITA OS — usePolicyDecision hook (Phase 19.D)
// Single canonical hook every high-risk surface consumes.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  resolveUnifiedPolicy,
  type UnifiedPolicyQuery,
  type UnifiedPolicyDecision,
} from "@/lib/policy/unified-policy-matrix";
import type { TrustLevel } from "@/lib/policy/policy-trust-thresholds";

export interface PolicyDecisionInput {
  domain: UnifiedPolicyQuery["domain"];
  riskClass: UnifiedPolicyQuery["riskClass"];
  actor?: UnifiedPolicyQuery["actor"];
  surface?: UnifiedPolicyQuery["surface"];
  deviceTrust?: TrustLevel;
  sensitivity?: UnifiedPolicyQuery["sensitivity"];
  tenantScope?: UnifiedPolicyQuery["tenantScope"];
  biometricStepUpRecent?: boolean;
  hasJustification?: boolean;
}

export interface PolicyDecisionResult extends UnifiedPolicyDecision {
  loading: boolean;
}

/**
 * Canonical UI gating hook. Components consume this to render
 * trust badges, refusal banners, step-up prompts, approval CTAs.
 */
export function usePolicyDecision(input: PolicyDecisionInput): PolicyDecisionResult {
  const { user, loading } = useAuth();

  const decision = useMemo<UnifiedPolicyDecision>(() => {
    const actor: UnifiedPolicyQuery["actor"] =
      input.actor ?? (user ? "user" : "anonymous");

    return resolveUnifiedPolicy({
      actor,
      domain: input.domain,
      surface: input.surface ?? "web",
      riskClass: input.riskClass,
      deviceTrust: input.deviceTrust ?? 2,
      sensitivity: input.sensitivity ?? "internal",
      tenantScope: input.tenantScope ?? "personal",
      biometricStepUpRecent: input.biometricStepUpRecent ?? false,
      hasJustification: input.hasJustification ?? false,
    });
  }, [
    user?.id,
    input.actor,
    input.domain,
    input.surface,
    input.riskClass,
    input.deviceTrust,
    input.sensitivity,
    input.tenantScope,
    input.biometricStepUpRecent,
    input.hasJustification,
  ]);

  return { ...decision, loading };
}
