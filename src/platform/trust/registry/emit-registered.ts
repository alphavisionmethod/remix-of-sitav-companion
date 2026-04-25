// ════════════════════════════════════════════════════════════
// SITA OS — emitRegisteredTrustAction (Phase 6)
// Service-layer ergonomic wrapper. Non-React code (hooks,
// services, autonomy controllers) calls this to emit a Trust
// receipt — and optionally open an approval — using only a
// registry key. Risk tier, pillar, reversibility, and approval
// requirements are sourced from the registry, never duplicated
// at the call site.
// ════════════════════════════════════════════════════════════

import { emitTrustReceipt, openTrustApproval } from "../index";
import {
  getTrustActionPreset,
  type TrustActionKey,
} from "./trust-action-registry";
import { evaluateActionAuthority } from "../authority/authority-evaluator";

export interface EmitRegisteredOptions {
  payload?: Record<string, unknown>;
  impactSummary?: string;
  correlationId?: string;
  /** When true, skip the authority check (the caller has already prompted the user). */
  bypassAuthorityCheck?: boolean;
}

export interface EmitRegisteredResult {
  receiptId: string;
  approvalId?: string;
  approvalStatus?: string;
  authorityLevel?: "suggest" | "ask" | "pre_approved" | "blocked";
  blocked?: boolean;
  blockedReason?: string;
}

/**
 * Emit a Trust receipt for a registered action, gating on approval
 * when the registry says so. Returns identifiers so callers can
 * thread them into downstream metadata.
 */
export async function emitRegisteredTrustAction(
  action: TrustActionKey,
  options: EmitRegisteredOptions = {},
): Promise<EmitRegisteredResult> {
  const preset = getTrustActionPreset(action);

  // Phase 2: consult the authority engine first.
  if (!options.bypassAuthorityCheck) {
    const decision = await evaluateActionAuthority(action);
    if (decision.isBlocked) {
      // Still record an "attempted" receipt so the audit trail captures the block.
      const r = await emitTrustReceipt({
        actionKey: preset.key,
        pillar: preset.pillar,
        payload: { ...(options.payload ?? {}), blocked: true, reason: decision.rationale },
        reversible: preset.reversible,
        riskTier: preset.riskTier,
        correlationId: options.correlationId,
      });
      return {
        receiptId: r.id,
        authorityLevel: decision.effectiveAuthority,
        blocked: true,
        blockedReason: decision.rationale,
      };
    }
  }

  let approvalId: string | undefined;
  let approvalStatus: string | undefined;
  if (preset.requireApproval) {
    const a = await openTrustApproval({
      actionKey: preset.key,
      pillar: preset.pillar,
      justification: options.impactSummary ?? `Trust-gated: ${preset.key}`,
      impactSummary: options.impactSummary ?? preset.description,
      riskTier: preset.riskTier,
      payload: options.payload,
    });
    approvalId = a.id;
    approvalStatus = a.status;
  }
  const r = await emitTrustReceipt({
    actionKey: preset.key,
    pillar: preset.pillar,
    payload: options.payload ?? {},
    reversible: preset.reversible,
    riskTier: preset.riskTier,
    correlationId: options.correlationId,
  });
  return {
    receiptId: r.id,
    approvalId,
    approvalStatus,
    authorityLevel: preset.defaultAuthorityLevel,
    blocked: false,
  };
}