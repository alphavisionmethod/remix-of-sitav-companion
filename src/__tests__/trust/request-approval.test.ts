// ═══════════════════════════════════════════════════════════════
// Phase 7.1 — Canonical client-side approval gate (foundation)
// Asserts the contract every risky action will rely on.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

const queueInsertMock = vi.fn();
const receiptInsertMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: unknown[]) => getUserMock(...a) },
    from: (table: string) => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({
          maybeSingle: () => {
            queueInsertMock(table, row);
            return Promise.resolve({ data: { id: "approval-1" }, error: null });
          },
        }),
      }),
    }),
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: (table: string) => ({
    insert: (row: Record<string, unknown>) => {
      receiptInsertMock(table, row);
      return Promise.resolve({ error: null });
    },
  }),
}));

import { requestApproval, withApprovalGate } from "@/lib/trust/request-approval";

beforeEach(() => {
  queueInsertMock.mockReset();
  receiptInsertMock.mockReset();
  getUserMock.mockReset();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
});

describe("requestApproval", () => {
  it("inserts into ai_workforce_approval_queue with the canonical envelope", async () => {
    const out = await requestApproval({
      actionType: "crm.contact.bulk_delete",
      title: "Bulk delete 42 contacts",
      justification: "Operator triggered cleanup of stale leads",
      riskTier: "high",
      payload: { ids: ["a", "b"] },
      costImplications: "Irreversible loss of contact data",
    });

    expect(out?.approvalId).toBe("approval-1");
    expect(out?.status).toBe("pending");
    expect(queueInsertMock).toHaveBeenCalledTimes(1);
    const [table, row] = queueInsertMock.mock.calls[0];
    expect(table).toBe("ai_workforce_approval_queue");
    expect(row).toMatchObject({
      user_id: "user-1",
      title: "Bulk delete 42 contacts",
      summary: "Operator triggered cleanup of stale leads",
      priority: "high",
      status: "pending",
      cost_implications: "Irreversible loss of contact data",
    });
    expect(row.evidence_links).toMatchObject({
      payload: { ids: ["a", "b"] },
      action_type: "crm.contact.bulk_delete",
    });
  });

  it("emits a paired pending_approval receipt that proof surfaces can render", async () => {
    await requestApproval({
      actionType: "crm.contact.bulk_delete",
      title: "Bulk delete",
      justification: "x",
      riskTier: "high",
    });

    expect(receiptInsertMock).toHaveBeenCalledTimes(1);
    const [table, row] = receiptInsertMock.mock.calls[0];
    expect(table).toBe("ai_action_receipts");
    expect(row).toMatchObject({
      action_type: "crm.contact.bulk_delete",
      status: "pending_approval",
      risk_tier: "high",
    });
    expect(row.metadata).toMatchObject({ approval_queue_id: "approval-1" });
  });

  it("maps risk → priority correctly", async () => {
    await requestApproval({ actionType: "x", title: "t", justification: "j", riskTier: "critical" });
    expect(queueInsertMock.mock.calls[0][1]).toMatchObject({ priority: "urgent" });

    queueInsertMock.mockReset();
    receiptInsertMock.mockReset();
    await requestApproval({ actionType: "x", title: "t", justification: "j", riskTier: "medium" });
    expect(queueInsertMock.mock.calls[0][1]).toMatchObject({ priority: "normal" });

    queueInsertMock.mockReset();
    receiptInsertMock.mockReset();
    await requestApproval({ actionType: "x", title: "t", justification: "j", riskTier: "low" });
    expect(queueInsertMock.mock.calls[0][1]).toMatchObject({ priority: "low" });
  });

  it("returns null when no user is authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const out = await requestApproval({
      actionType: "x",
      title: "t",
      justification: "j",
      riskTier: "high",
    });
    expect(out).toBeNull();
    expect(queueInsertMock).not.toHaveBeenCalled();
  });

  it("respects skip:true (demo mode)", async () => {
    const out = await requestApproval({
      actionType: "x",
      title: "t",
      justification: "j",
      riskTier: "high",
      skip: true,
    });
    expect(out).toBeNull();
    expect(queueInsertMock).not.toHaveBeenCalled();
  });
});

describe("withApprovalGate", () => {
  it("short-circuits and enqueues approval at/above threshold (default high)", async () => {
    const action = vi.fn(() => Promise.resolve("executed"));
    const out = await withApprovalGate(action, {
      actionType: "crm.contact.bulk_delete",
      title: "Bulk delete",
      justification: "j",
      riskTier: "high",
    });
    expect(out.gated).toBe(true);
    if (out.gated) expect(out.approvalId).toBe("approval-1");
    expect(action).not.toHaveBeenCalled();
    expect(queueInsertMock).toHaveBeenCalledTimes(1);
  });

  it("executes inline below threshold", async () => {
    const action = vi.fn(() => Promise.resolve({ ok: true }));
    const out = await withApprovalGate(action, {
      actionType: "crm.contact.update",
      title: "Update",
      justification: "j",
      riskTier: "low",
    });
    expect(out.gated).toBe(false);
    if (!out.gated) expect(out.result).toEqual({ ok: true });
    expect(action).toHaveBeenCalledTimes(1);
    expect(queueInsertMock).not.toHaveBeenCalled();
  });

  it("custom threshold respected", async () => {
    const action = vi.fn(() => Promise.resolve("ok"));
    // riskTier=medium, threshold=medium → gate
    const out = await withApprovalGate(action, {
      actionType: "x",
      title: "t",
      justification: "j",
      riskTier: "medium",
      threshold: "medium",
    });
    expect(out.gated).toBe(true);
    expect(action).not.toHaveBeenCalled();
  });

  it("skip:true bypasses gating and executes inline", async () => {
    const action = vi.fn(() => Promise.resolve("ok"));
    const out = await withApprovalGate(action, {
      actionType: "x",
      title: "t",
      justification: "j",
      riskTier: "critical",
      skip: true,
    });
    expect(out.gated).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);
    expect(queueInsertMock).not.toHaveBeenCalled();
  });
});