// ════════════════════════════════════════════════════════════
// Trust Layer — Stable platform surface for all 4 pillars
// ════════════════════════════════════════════════════════════
// Phase 2: contracts wired to canonical Supabase tables. Pillars
// MUST go through this barrel; never import audit-ledger /
// approval-engine directly from inside src/modules/<pillar>/.

export const TRUST_LAYER = {
  id: "trust",
  label: "Trust Center",
  routePrefix: "/trust",
  description: "Receipts · Approvals · Permissions · Automation Authority · Audit",
} as const;

export type TrustLayer = typeof TRUST_LAYER;

export type TrustPillarId = "business" | "concierge" | "finance" | "health" | "shared";
export type RiskTier = "low" | "medium" | "high" | "critical";

export interface TrustReceiptInput {
  actionKey: string;
  pillar: TrustPillarId;
  payload: Record<string, unknown>;
  reversible?: boolean;
  riskTier?: RiskTier;
  correlationId?: string;
}

export interface ApprovalRequestInput {
  actionKey: string;
  pillar: TrustPillarId;
  justification: string;
  impactSummary?: string;
  riskTier?: RiskTier;
  payload?: Record<string, unknown>;
}

/**
 * Emit a signed action receipt. Pillars use this for every mutating
 * operation. Persists to ai_action_receipts and feeds the Trust Center.
 */
export async function emitTrustReceipt(input: TrustReceiptInput): Promise<{ id: string }> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { id: "noop" };
  const { data, error } = await supabase
    .from("ai_action_receipts")
    .insert({
      user_id: userId,
      action_type: input.actionKey,
      action_payload: { pillar: input.pillar, ...input.payload },
      recommendation_summary: `${input.pillar}:${input.actionKey}`,
      risk_tier: input.riskTier ?? "low",
      status: "logged",
      metadata: {
        reversible: input.reversible ?? false,
        correlationId: input.correlationId,
        emittedVia: "trust-layer",
      },
    })
    .select("id")
    .single();
  if (error || !data) {
    console.warn("[trust] emitTrustReceipt failed:", error?.message);
    return { id: "error" };
  }
  return { id: (data as { id: string }).id };
}

/**
 * Open an approval request. Critical pillar actions MUST gate on
 * the resolved status before execution.
 */
export async function openTrustApproval(input: ApprovalRequestInput): Promise<{ id: string; status: string }> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { id: "noop", status: "skipped" };
  const { data, error } = await (supabase as unknown as {
    from: (t: string) => {
      insert: (v: Record<string, unknown>) => {
        select: (s: string) => { single: () => Promise<{ data: { id: string; status: string } | null; error: { message: string } | null }> };
      };
    };
  })
    .from("approval_requests")
    .insert({
      user_id: userId,
      action_key: input.actionKey,
      domain: input.pillar,
      justification: input.justification,
      impact_summary: input.impactSummary ?? null,
      risk_tier: input.riskTier ?? "medium",
      params: input.payload ?? {},
      status: "pending",
    })
    .select("id, status")
    .single();
  if (error || !data) {
    console.warn("[trust] openTrustApproval failed:", error?.message);
    return { id: "error", status: "error" };
  }
  return { id: data.id, status: data.status };
}

// ── Phase 5 re-exports ────────────────────────────────────────
export {
  TRUST_ACTION_REGISTRY,
  TRUST_ACTION_LIST,
  getTrustActionPreset,
  type TrustActionKey,
  type TrustActionPreset,
} from "./registry/trust-action-registry";
export { TrustBoundary } from "./ui/TrustBoundary";
export { TrustActionButton } from "./ui/TrustActionButton";