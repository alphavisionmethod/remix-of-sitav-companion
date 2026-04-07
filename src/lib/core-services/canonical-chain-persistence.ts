// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Chain Persistence Adapter
// Persists receipts, proofs, projections, envelopes, approvals to DB
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { Receipt } from "./receipt-service";
import type { ExecutionEnvelope } from "./executor-service";
import type { Projection } from "./projection-service";

// ── Persist Receipt ─────────────────────────────────────────────

export async function persistChainReceipt(
  userId: string,
  receipt: Receipt,
  domain?: string
): Promise<void> {
  try {
    await fromTable("receipts").insert({
      user_id: userId,
      type: receipt.receiptType,
      hash: receipt.hash,
      entity_id: receipt.envelopeId || receipt.capabilityId || null,
      domain: domain || null,
      payload: {
        correlationId: receipt.correlationId,
        sequenceNumber: receipt.sequenceNumber,
        previousHash: receipt.previousHash,
        status: receipt.status,
        data: receipt.data,
      },
    });
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist receipt:", e);
  }
}

// ── Persist Proof / Verification ────────────────────────────────

export async function persistChainProof(
  userId: string,
  correlationId: string,
  action: string,
  capabilityId: string,
  evidence: Record<string, unknown>,
  domain?: string
): Promise<void> {
  try {
    const encoder = new TextEncoder();
    const data = JSON.stringify({ correlationId, action, evidence, timestamp: Date.now() });
    let hash: string;
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
      hash = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    } else {
      let h = 0;
      for (let i = 0; i < data.length; i++) h = ((h << 5) - h + data.charCodeAt(i)) | 0;
      hash = Math.abs(h).toString(16).padStart(16, "0");
    }

    await fromTable("proof_records").insert({
      user_id: userId,
      action,
      actor: "canonical-chain",
      entity_id: capabilityId,
      domain: domain || null,
      hash,
      evidence,
      metadata: { correlationId },
    });
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist proof:", e);
  }
}

// ── Persist Execution Envelope ──────────────────────────────────

export async function persistChainEnvelope(
  userId: string,
  envelope: ExecutionEnvelope,
  correlationId: string
): Promise<void> {
  try {
    await fromTable("execution_envelopes").insert({
      user_id: userId,
      capability_id: envelope.capabilityId,
      status: envelope.status,
      intent: { correlationId, mode: envelope.mode, payload: envelope.payload },
      result: envelope.result || null,
      approved_by: (envelope as Record<string, unknown>).approvedBy || null,
      metadata: {
        correlationId,
        durationMs: envelope.durationMs,
        errorDetails: envelope.errorDetails,
      },
    });
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist envelope:", e);
  }
}

// ── Persist Projection Snapshot ─────────────────────────────────

export async function persistChainProjection(
  userId: string,
  projection: Projection,
  domain: string
): Promise<void> {
  try {
    // Upsert — update if same type+id exists, insert otherwise
    const key = `${projection.type}:${projection.id}`;
    const { data: existing } = await (supabase as unknown)
      .from("projections")
      .select("id")
      .eq("user_id", userId)
      .eq("type", projection.type)
      .eq("domain", domain)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await fromTable("projections").update({
        data: { state: projection.state, eventCount: projection.eventCount, lastEventId: projection.lastEventId, snapshotAt: projection.snapshotAt },
        generated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await fromTable("projections").insert({
        user_id: userId,
        type: projection.type,
        domain,
        data: { key, state: projection.state, eventCount: projection.eventCount, lastEventId: projection.lastEventId, snapshotAt: projection.snapshotAt },
        metadata: { source: "canonical-chain" },
      });
    }
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist projection:", e);
  }
}

// ── Persist Approval Decision ───────────────────────────────────

export async function persistChainApproval(
  userId: string,
  correlationId: string,
  actionSummary: string,
  proposedAction: Record<string, unknown>,
  riskLevel: string,
  domain?: string
): Promise<void> {
  try {
    await fromTable("approval_queue").insert({
      user_id: userId,
      action_summary: actionSummary,
      proposed_action: proposedAction,
      risk_level: riskLevel,
      domain: domain || null,
      status: "pending",
      metadata: { correlationId, source: "canonical-chain" },
    });
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist approval:", e);
  }
}

// ── Batch Persist Event ─────────────────────────────────────────

export async function persistChainEvent(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>,
  correlationId: string,
  domain?: string
): Promise<void> {
  try {
    await fromTable("events").insert({
      user_id: userId,
      event_type: eventType,
      payload,
      correlation_id: correlationId,
      domain: domain || null,
      source: "canonical-chain",
    });
  } catch (e) {
    console.error("[ChainPersistence] Failed to persist event:", e);
  }
}
