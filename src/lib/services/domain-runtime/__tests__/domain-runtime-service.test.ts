// ═══════════════════════════════════════════════════════════════
// SITA OS — Unit Tests: Domain Runtime Service
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }) }),
      upsert: () => ({ error: null }),
    }),
  },
}));

describe("Domain Runtime Service", () => {
  it("returns 15 canonical domains when DB is empty", async () => {
    const { getDomainRuntimeStatuses } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const domains = await getDomainRuntimeStatuses();
    expect(domains.length).toBe(15);
  });

  it("each domain has valid structure", async () => {
    const { getDomainRuntimeStatuses } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const domains = await getDomainRuntimeStatuses();

    for (const d of domains) {
      expect(d.domain_key).toBeTruthy();
      expect(d.domain_name).toBeTruthy();
      expect(["real", "demo", "scaffold", "partial"]).toContain(d.runtime_class);
      expect(typeof d.has_db_tables).toBe("boolean");
      expect(typeof d.has_rls_policies).toBe("boolean");
      expect(typeof d.has_real_service).toBe("boolean");
      expect(typeof d.has_edge_functions).toBe("boolean");
      expect(typeof d.demo_provider_exists).toBe("boolean");
      expect(typeof d.empty_state_handled).toBe("boolean");
      expect(d.truth_score).toBeGreaterThanOrEqual(0);
      expect(d.truth_score).toBeLessThanOrEqual(100);
    }
  });

  it("all domains score 90 pre-launch (no user data)", async () => {
    const { getDomainRuntimeStatuses } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const domains = await getDomainRuntimeStatuses();

    for (const d of domains) {
      expect(d.truth_score).toBe(90);
      expect(d.has_real_data).toBe(false); // Honest: no user data pre-launch
    }
  });

  it("computes correct runtime truth index", async () => {
    const { getRuntimeTruthIndex } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const records = [
      { truth_score: 90 },
      { truth_score: 80 },
      { truth_score: 100 },
    ] as never[];
    expect(getRuntimeTruthIndex(records)).toBe(90);
  });

  it("returns 0 for empty records", async () => {
    const { getRuntimeTruthIndex } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    expect(getRuntimeTruthIndex([])).toBe(0);
  });

  it("exposes domain list", async () => {
    const { getDomainList } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const list = getDomainList();
    expect(list.length).toBe(15);
    expect(list[0]).toHaveProperty("key");
    expect(list[0]).toHaveProperty("name");
  });
});
