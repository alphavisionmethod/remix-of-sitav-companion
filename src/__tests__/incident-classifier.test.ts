import { describe, it, expect, beforeEach, vi } from "vitest";
import { classifyIncident, clearIncidentClassifierCache } from "@/lib/incidents/incident-classifier";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({
          data: [
            { subsystem: "payments", symptom_code: "gateway_timeout", display_name: "Payment gateway timeout",
              severity: "critical", recommended_runbook_id: "RB-005", recommended_switch_id: "KS-PAYMENTS",
              escalation_owner: "finance-os", description: null, is_active: true },
            { subsystem: "payments", symptom_code: "duplicate_charge", display_name: "Duplicate charge",
              severity: "critical", recommended_runbook_id: "RB-005", recommended_switch_id: "KS-PAYMENTS",
              escalation_owner: "finance-os", description: null, is_active: true },
            { subsystem: "ai-providers", symptom_code: "quota_exhausted", display_name: "Quota",
              severity: "high", recommended_runbook_id: "RB-010", recommended_switch_id: "KS-MODEL-PROVIDERS",
              escalation_owner: "ai", description: null, is_active: true },
          ],
          error: null,
        }),
      }),
    }),
  },
}));

describe("incident-classifier", () => {
  beforeEach(() => clearIncidentClassifierCache());

  it("returns exact match by subsystem+symptom", async () => {
    const c = await classifyIncident("payments", "gateway_timeout");
    expect(c?.recommendedRunbookId).toBe("RB-005");
    expect(c?.recommendedSwitchId).toBe("KS-PAYMENTS");
  });

  it("falls back to highest-severity classification for subsystem when symptom unknown", async () => {
    const c = await classifyIncident("payments", "nonexistent");
    expect(c?.recommendedRunbookId).toBe("RB-005");
    expect(c?.severity).toBe("critical");
  });

  it("returns null for unknown subsystem", async () => {
    const c = await classifyIncident("nonexistent");
    expect(c).toBeNull();
  });

  it("escalation owner is populated", async () => {
    const c = await classifyIncident("ai-providers", "quota_exhausted");
    expect(c?.escalationOwner).toBe("ai");
  });
});
