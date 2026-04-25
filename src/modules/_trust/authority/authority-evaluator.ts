// ════════════════════════════════════════════════════════════
// SITA OS — Authority Evaluator (Phase 2)
// Service-layer wrapper around public.evaluate_action_authority.
// Pillars + the AI orchestrator call evaluateActionAuthority()
// to learn whether an action is allowed to run automatically,
// must prompt the user, or is outright blocked.
// ════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { TrustActionKey } from "../registry/trust-action-registry";
import type { AuthorityLevel } from "../registry/trust-action-registry";

export interface AuthorityDecision {
  actionKey: string;
  effectiveAuthority: AuthorityLevel;
  source: "user_override" | "catalog_default" | "fallback";
  pillar: string;
  riskTier: "low" | "medium" | "high" | "critical";
  requireApproval: boolean;
  reversible: boolean;
  /** True when the caller may execute without further user prompting. */
  canAutoExecute: boolean;
  /** True when the action is hard-blocked and must not run. */
  isBlocked: boolean;
  /** Human-readable explanation suitable for explainability surfaces. */
  rationale: string;
}

const FALLBACK: AuthorityDecision = {
  actionKey: "unknown",
  effectiveAuthority: "ask",
  source: "fallback",
  pillar: "shared",
  riskTier: "medium",
  requireApproval: false,
  reversible: true,
  canAutoExecute: false,
  isBlocked: false,
  rationale: "No catalog entry found — defaulting to ask for safety.",
};

function rationaleFor(level: AuthorityLevel, source: AuthorityDecision["source"]): string {
  const src =
    source === "user_override"
      ? "your saved preference"
      : source === "catalog_default"
        ? "the system default"
        : "the safe-by-default fallback";
  switch (level) {
    case "pre_approved":
      return `Auto-executing per ${src}.`;
    case "ask":
      return `Asking for confirmation per ${src}.`;
    case "blocked":
      return `Action is blocked per ${src}.`;
    case "suggest":
    default:
      return `Surfacing as a suggestion per ${src}.`;
  }
}

/**
 * Resolve the effective authority for a registered action.
 * Falls back to safe defaults if the user is signed out or the RPC
 * is temporarily unavailable.
 */
export async function evaluateActionAuthority(
  actionKey: TrustActionKey | string,
): Promise<AuthorityDecision> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ...FALLBACK, actionKey };

  const { data, error } = await (supabase as unknown as {
    rpc: (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{
      data:
        | Array<{
            action_key: string;
            effective_authority: AuthorityLevel;
            source: AuthorityDecision["source"];
            pillar: string;
            risk_tier: AuthorityDecision["riskTier"];
            require_approval: boolean;
            reversible: boolean;
          }>
        | null;
      error: { message: string } | null;
    }>;
  }).rpc("evaluate_action_authority", {
    _action_key: actionKey,
    _user_id: userId,
  });

  if (error || !data || data.length === 0) {
    return { ...FALLBACK, actionKey };
  }

  const row = data[0];
  const level = row.effective_authority;
  return {
    actionKey: row.action_key,
    effectiveAuthority: level,
    source: row.source,
    pillar: row.pillar,
    riskTier: row.risk_tier,
    requireApproval: row.require_approval,
    reversible: row.reversible,
    canAutoExecute: level === "pre_approved",
    isBlocked: level === "blocked",
    rationale: rationaleFor(level, row.source),
  };
}

/**
 * Persist a user override for a given action.
 */
export async function setActionAuthority(
  actionKey: string,
  level: AuthorityLevel,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false, error: "Not signed in" };

  const { error } = await (supabase as unknown as {
    from: (t: string) => {
      upsert: (
        v: Record<string, unknown>,
        opts?: { onConflict: string },
      ) => Promise<{ error: { message: string } | null }>;
    };
  })
    .from("automation_authority_settings")
    .upsert(
      {
        user_id: userId,
        action_key: actionKey,
        authority_level: level,
        reason: reason ?? null,
        set_by: "user",
      },
      { onConflict: "user_id,action_key" },
    );
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Drop a user override (revert to catalog default).
 */
export async function clearActionAuthority(actionKey: string): Promise<{ ok: boolean }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false };
  const { error } = await (supabase as unknown as {
    from: (t: string) => {
      delete: () => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
        };
      };
    };
  })
    .from("automation_authority_settings")
    .delete()
    .eq("user_id", userId)
    .eq("action_key", actionKey);
  return { ok: !error };
}