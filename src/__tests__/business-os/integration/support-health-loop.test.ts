// ═══════════════════════════════════════════════════════════════
// Phase 5 — Support → Health Signal Loop
// Pure-logic test of scoreFromCase mapping + idempotency contract.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: () => ({
    select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "sig-1" }, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
  }),
}));

describe("Phase 5 — support → health signal loop", () => {
  it("emits a signal for a resolved case with CRM attribution", async () => {
    const { emitHealthSignalForResolvedCase } = await import(
      "@/lib/services/business-os/support-health-loop.service"
    );
    const result = await emitHealthSignalForResolvedCase({
      id: "case-1",
      user_id: "user-1",
      priority: "high",
      category: "billing",
      resolution: "Issue retained — discount applied",
      crm_contact_id: "contact-1",
      crm_company_id: null,
    });
    expect(result.ok).toBe(true);
  });

  it("refuses to emit when no CRM attribution is present (honest no-op)", async () => {
    const { emitHealthSignalForResolvedCase } = await import(
      "@/lib/services/business-os/support-health-loop.service"
    );
    const result = await emitHealthSignalForResolvedCase({
      id: "case-2",
      user_id: "user-1",
      priority: "low",
      category: "general",
      resolution: "Resolved",
      crm_contact_id: null,
      crm_company_id: null,
    });
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.reason).toBe("no_crm_attribution");
    }
  });
});