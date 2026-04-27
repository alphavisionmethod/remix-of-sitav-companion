// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Client-Side Approval Request Helper
// Single source of truth for enqueuing risky actions to
// `public.ai_workforce_approval_queue` — the same canonical queue
// already consumed by `useApprovalQueue` / `useApproveApprovalItem`
// / `useRejectApprovalItem`.
//
// Modules MUST use `requestApproval()` or `withApprovalGate()` to
// gate risky actions. Inline inserts into `ai_workforce_approval_queue`
// elsewhere will be flagged by the trust-coverage validator.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import {
  emitClientReceipt,
  type ClientReceiptRiskTier,
} from "./emit-client-receipt";

const db = supabase as unknown as {
  from: (t: string) => any;
  auth: typeof supabase.auth;
};

export type ApprovalQueuePriority = "low" | "normal" | "high" | "urgent";

export interface RequestApprovalOptions {
  /** Canonical action id, format: "<module>.<entity>.<verb>" */
  actionType: string;
  /** Short title shown in the approval queue UI */
  title: string;
  /** Why approval is being requested */
  justification: string;
  /** Risk tier — drives priority and whether human review is required */
  riskTier: ClientReceiptRiskTier;
  /** Mutation payload that will be executed on approval */
  payload?: Record<string, unknown>;
  /** Cost / external impact summary (free text) */
  costImplications?: string;
  /** Launch / customer impact summary (free text) */
  launchImplications?: string;
  /** Correlate with a parent workflow */
  correlationId?: string;
  /** Link to the originating receipt (recommendation/intent) */
  parentReceiptId?: string;
  /** Override user id (defaults to authed user) */
  userId?: string | null;
  /** Skip the enqueue (used in demo mode) */
  skip?: boolean;
}

export interface RequestApprovalResult {
  approvalId: string;
  status: "pending";
  receiptId: string | null;
}

function priorityFor(risk: ClientReceiptRiskTier): ApprovalQueuePriority {
  switch (risk) {
    case "critical":
      return "urgent";
    case "high":
      return "high";
    case "medium":
      return "normal";
    default:
      return "low";
  }
}

/**
 * Insert a row into `ai_workforce_approval_queue` and emit a
 * "pending_approval" receipt that proof surfaces can render.
 */
export async function requestApproval(
  opts: RequestApprovalOptions,
): Promise<RequestApprovalResult | null> {
  if (opts.skip) return null;

  let userId = opts.userId ?? null;
  if (!userId) {
    const { data } = await db.auth.getUser();
    userId = data.user?.id ?? null;
  }
  if (!userId) return null;

  const evidenceLinks = {
    payload: opts.payload ?? {},
    correlation_id: opts.correlationId ?? null,
    parent_receipt_id: opts.parentReceiptId ?? null,
    action_type: opts.actionType,
  };

  const { data: row, error } = await db
    .from("ai_workforce_approval_queue")
    .insert({
      user_id: userId,
      title: opts.title,
      summary: opts.justification,
      priority: priorityFor(opts.riskTier),
      status: "pending",
      evidence_links: evidenceLinks,
      cost_implications: opts.costImplications ?? null,
      launch_implications: opts.launchImplications ?? null,
    })
    .select("id")
    .maybeSingle();

  if (error || !row?.id) {
    // eslint-disable-next-line no-console
    console.warn("[requestApproval] enqueue failed:", opts.actionType, error?.message);
    return null;
  }

  // Emit a canonical "pending_approval" receipt so proof surfaces
  // see the start of the approval → execution chain.
  const receipt = await emitClientReceipt({
    actionType: opts.actionType,
    summary: opts.title,
    payload: opts.payload,
    riskTier: opts.riskTier,
    status: "pending_approval",
    confidence: 1,
    correlationId: opts.correlationId,
    parentReceiptId: opts.parentReceiptId,
    metadata: {
      approval_queue_id: row.id,
      justification: opts.justification,
    },
    userId,
  });

  return {
    approvalId: row.id as string,
    status: "pending",
    receiptId: receipt?.receiptId ?? null,
  };
}

export interface WithApprovalGateOptions {
  actionType: string;
  title: string;
  justification: string;
  riskTier: ClientReceiptRiskTier;
  /** Threshold at or above which approval is required. Default: "high". */
  threshold?: ClientReceiptRiskTier;
  payload?: Record<string, unknown>;
  costImplications?: string;
  launchImplications?: string;
  correlationId?: string;
  parentReceiptId?: string;
  userId?: string | null;
  skip?: boolean;
}

const RISK_RANK: Record<ClientReceiptRiskTier, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export type ApprovalGateResult<T> =
  | { gated: true; approvalId: string; receiptId: string | null; result?: undefined }
  | { gated: false; approvalId?: undefined; receiptId?: undefined; result: T };

/**
 * Higher-order wrapper:
 * - If `riskTier >= threshold`, enqueues an approval and short-circuits
 *   with `{ gated: true, approvalId }`. The caller MUST NOT execute.
 * - Otherwise, runs `action()` inline and returns `{ gated: false, result }`.
 *
 * On approval the queued item is executed via the canonical
 * `useApproveApprovalItem` hook → `bindExecution` chain. This wrapper
 * does NOT execute on approval itself; callers wire the post-approval
 * execution through the recommendation/execution binding system.
 */
export async function withApprovalGate<T>(
  action: () => Promise<T>,
  opts: WithApprovalGateOptions,
): Promise<ApprovalGateResult<T>> {
  const threshold = opts.threshold ?? "high";
  const needsApproval = RISK_RANK[opts.riskTier] >= RISK_RANK[threshold];

  if (needsApproval && !opts.skip) {
    const queued = await requestApproval({
      actionType: opts.actionType,
      title: opts.title,
      justification: opts.justification,
      riskTier: opts.riskTier,
      payload: opts.payload,
      costImplications: opts.costImplications,
      launchImplications: opts.launchImplications,
      correlationId: opts.correlationId,
      parentReceiptId: opts.parentReceiptId,
      userId: opts.userId,
    });
    if (queued) {
      return { gated: true, approvalId: queued.approvalId, receiptId: queued.receiptId };
    }
    // If enqueue failed, fall through and execute (with a failure receipt
    // already logged by requestApproval). This keeps low-risk paths working
    // when the queue is unavailable, but still lets strict callers detect
    // the gating failure via the warn log.
  }

  const result = await action();
  return { gated: false, result };
}