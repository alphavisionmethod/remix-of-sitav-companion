// ═══════════════════════════════════════════════════════════════
// Phase 7.1 — receiptRowToProofEntry mapper
// Asserts the canonical receipt → ProofEntry projection used by
// every module-level proof surface.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { receiptRowToProofEntry } from "@/lib/trust/proof-entry";

describe("receiptRowToProofEntry", () => {
  it("projects a CRM create receipt to a 'created' proof entry", () => {
    const entry = receiptRowToProofEntry({
      id: "row-1",
      receipt_id: "rcpt-1",
      action_type: "crm.contact.create",
      recommendation_summary: "Created contact",
      status: "executed",
      confidence: 0.95,
      action_payload: { entity_id: "c1", field: "email", new_value: "a@b.com" },
      metadata: { actor_name: "Operator" },
      executed_at: "2026-04-27T12:00:00Z",
      created_at: "2026-04-27T12:00:00Z",
    });
    expect(entry.action).toBe("created");
    expect(entry.actor.type).toBe("user");
    expect(entry.actor.name).toBe("Operator");
    expect(entry.field).toBe("email");
    expect(entry.newValue).toBe("a@b.com");
    expect(entry.confidence).toBe(95);
    expect(entry.receipt_hash).toBe("rcpt-1");
    expect(entry.timestamp).toBe("2026-04-27T12:00:00Z");
  });

  it("infers actor=automation from autopilot.* action types", () => {
    const entry = receiptRowToProofEntry({
      id: "r2",
      action_type: "autopilot.config.update",
      recommendation_summary: "Autopilot updated",
      status: "executed",
      created_at: "2026-04-27T12:00:00Z",
    });
    expect(entry.actor.type).toBe("automation");
    expect(entry.action).toBe("automated");
  });

  it("maps status=failed → action='failed'", () => {
    const entry = receiptRowToProofEntry({
      id: "r3",
      action_type: "crm.contact.update",
      recommendation_summary: "x",
      status: "failed",
      created_at: "2026-04-27T12:00:00Z",
    });
    expect(entry.action).toBe("failed");
  });

  it("maps verb 'rollback' → 'rolled_back'", () => {
    const entry = receiptRowToProofEntry({
      id: "r4",
      action_type: "crm.contact.rollback",
      recommendation_summary: "x",
      status: "executed",
      created_at: "2026-04-27T12:00:00Z",
    });
    expect(entry.action).toBe("rolled_back");
  });

  it("preserves parent_receipt_id from metadata for outcome lineage", () => {
    const entry = receiptRowToProofEntry({
      id: "r5",
      action_type: "crm.contact.delete",
      recommendation_summary: "x",
      status: "executed",
      metadata: { parent_receipt_id: "rcpt-parent" },
      created_at: "2026-04-27T12:00:00Z",
    });
    expect(entry.parent_receipt_id).toBe("rcpt-parent");
  });

  it("falls back to created_at when executed_at is null", () => {
    const entry = receiptRowToProofEntry({
      id: "r6",
      action_type: "crm.contact.update",
      recommendation_summary: "x",
      status: "pending_approval",
      created_at: "2026-04-27T11:00:00Z",
      executed_at: null,
    });
    expect(entry.timestamp).toBe("2026-04-27T11:00:00Z");
  });
});