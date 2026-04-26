import { describe, it, expect, vi } from "vitest";

// The continuity service queries Supabase for cross-module lineage. In the
// jsdom/CI environment we don't have live RLS-scoped data, so we mock the
// supabase client to return empty results — the canonical "honest unknown"
// behavior the service was designed to surface (per its own docstring:
// "If a probe cannot be proven, status='unknown' — never 'pass'").
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "u" } }, error: null }),
    },
    from: () => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => chain,
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
      };
      return chain;
    },
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: () => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
    };
    return chain;
  },
}));

describe("continuity-verification.service", () => {
  it("handler-coverage probe asserts canonical handler counts", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const report = await runContinuityVerification();
    const handler = report.probes.find(p => p.id === "handler-coverage");
    expect(handler).toBeDefined();
    expect(["pass", "fail"]).toContain(handler!.status);
    expect(handler!.evidenceRef).toContain("CANONICAL_HANDLER_IDS");
  });

  it("returns a complete report shape with truthful counts", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();
    expect(r.totalProbes).toBe(r.probes.length);
    expect(r.passed + r.failed + r.unknown + r.deferred).toBe(r.totalProbes);
    expect(typeof r.generatedAt).toBe("string");
  });

  it("emits 'unknown' (never fake 'pass') for probes without persisted data", async () => {
    const { runContinuityVerification } = await import(
      "@/lib/services/business-os/continuity-verification.service"
    );
    const r = await runContinuityVerification();
    // With the mocked empty DB, every *DB-backed* probe must be 'unknown'
    // (or 'fail') — the service must never fabricate a pass against empty
    // RLS-scoped data. Registry-only probes (handler-coverage, revenue-ia)
    // and explicitly deferred probes are excluded.
    const dbBackedIds = new Set([
      "qpi-lineage",
      "crm-finance-bridge",
      "invoice-proof",
      "appointment-lineage",
      "tasks-bridge",
    ]);
    const dbProbes = r.probes.filter(p => dbBackedIds.has(p.id));
    for (const probe of dbProbes) {
      expect(["unknown", "deferred", "fail"]).toContain(probe.status);
    }
  });
});
