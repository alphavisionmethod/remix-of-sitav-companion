// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Client-Side Receipt Emitter
// Single source of truth for in-app (non-edge) action receipts.
// Writes to `public.ai_action_receipts` — the same canonical table
// used by edge functions (`_shared/receipt-emitter.ts`) and by the
// kernel executor (`executeAction.service.ts`).
//
// USE THIS HELPER FROM EVERY MODULE MUTATION. Do NOT inline a
// `fromTable("ai_action_receipts").insert(...)` call elsewhere —
// the trust-coverage validator will fail.
// ═══════════════════════════════════════════════════════════════

import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

export type ClientReceiptStatus =
  | "executed"
  | "completed"
  | "failed"
  | "pending_approval"
  | "rolled_back";

export type ClientReceiptRiskTier = "low" | "medium" | "high" | "critical";

export interface EmitClientReceiptOptions {
  /** Canonical action id, format: "<module>.<entity>.<verb>" e.g. "crm.contact.create" */
  actionType: string;
  /** Short, human-readable summary of what happened */
  summary: string;
  /** Mutation payload — entity_id, diff, etc. Stored in action_payload. */
  payload?: Record<string, unknown>;
  /** Risk tier per the policy matrix */
  riskTier?: ClientReceiptRiskTier;
  /** Lifecycle status of the action */
  status?: ClientReceiptStatus;
  /** 0..1 — confidence the action was correct */
  confidence?: number;
  /** Correlate multiple receipts that share a single workflow */
  correlationId?: string;
  /** Link this receipt to a parent (e.g. approval → execution → rollback) */
  parentReceiptId?: string;
  /** Free-form metadata (actor name, lineage refs, etc.) */
  metadata?: Record<string, unknown>;
  /** Override the user_id (defaults to the authenticated user) */
  userId?: string | null;
  /** Throw on failure instead of swallowing the error */
  strict?: boolean;
  /** Skip the write entirely (used in demo mode by callers) */
  skip?: boolean;
}

export interface EmitClientReceiptResult {
  receiptId: string;
}

/**
 * Emit a canonical action receipt to `ai_action_receipts`.
 *
 * Fire-and-forget by default. Failures are logged but never thrown
 * unless `strict: true`. Returns `null` if the user is not signed in
 * or if `skip: true` is passed.
 */
export async function emitClientReceipt(
  opts: EmitClientReceiptOptions,
): Promise<EmitClientReceiptResult | null> {
  if (opts.skip) return null;

  let userId = opts.userId ?? null;
  if (!userId) {
    try {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
    } catch {
      userId = null;
    }
  }
  if (!userId) {
    if (opts.strict) {
      throw new Error("emitClientReceipt: no authenticated user");
    }
    return null;
  }

  const receiptId = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `r_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const metadata = {
    ...(opts.metadata ?? {}),
    ...(opts.correlationId ? { correlation_id: opts.correlationId } : {}),
    ...(opts.parentReceiptId ? { parent_receipt_id: opts.parentReceiptId } : {}),
    emitter: opts.metadata?.emitter ?? "client",
  };

  try {
    const { error } = await fromTable("ai_action_receipts").insert({
      user_id: userId,
      action_type: opts.actionType,
      recommendation_summary: opts.summary,
      action_payload: opts.payload ?? {},
      confidence: typeof opts.confidence === "number" ? opts.confidence : 1,
      risk_tier: opts.riskTier ?? "low",
      status: opts.status ?? "executed",
      executed_at: new Date().toISOString(),
      receipt_id: receiptId,
      metadata,
    });
    if (error) {
      if (opts.strict) throw error;
      // eslint-disable-next-line no-console
      console.warn("[emitClientReceipt] insert failed:", opts.actionType, error.message);
      return null;
    }
    return { receiptId };
  } catch (err) {
    if (opts.strict) throw err;
    // eslint-disable-next-line no-console
    console.warn("[emitClientReceipt] error:", opts.actionType, err);
    return null;
  }
}

export interface EmitClientFailureReceiptOptions
  extends Omit<EmitClientReceiptOptions, "status"> {
  errorCode?: string;
  errorMessage: string;
}

/**
 * Emit a failure receipt — same canonical table, status="failed",
 * with structured error fields in metadata.
 */
export async function emitClientFailureReceipt(
  opts: EmitClientFailureReceiptOptions,
): Promise<EmitClientReceiptResult | null> {
  return emitClientReceipt({
    ...opts,
    status: "failed",
    confidence: opts.confidence ?? 0,
    metadata: {
      ...(opts.metadata ?? {}),
      error_code: opts.errorCode ?? "unknown",
      error_message: opts.errorMessage,
    },
  });
}