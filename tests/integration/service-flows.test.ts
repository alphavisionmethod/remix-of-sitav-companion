import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: (...args: any[]) => {
        const hasHead = args[1]?.head;
        if (hasHead) return Promise.resolve({ count: 5, data: null, error: null });
        return { order: () => Promise.resolve({ data: [], error: null }), then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb) };
      },
      upsert: () => Promise.resolve({ error: null }),
      insert: () => Promise.resolve({ error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

describe("Integration: Mode Resolution → Provider Selection", () => {
  it("real mode resolves to real provider path", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const r1 = resolveByMode({ mode: "real", realData: [1], demoData: [2], emptyDefault: [] });
    expect(r1.source).toBe("real");
  });

  it("demo mode resolves to demo provider path", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({ mode: "demo", realData: [1], demoData: [2], emptyDefault: [] });
    expect(result.source).toBe("demo");
  });

  it("mode resolution chain: URL → session → default", async () => {
    sessionStorage.clear();
    const { resolveMode, clearModeOverride } = await import("@/lib/dual-reality/reality-mode-resolver");
    let res = resolveMode({ searchParams: new URLSearchParams() });
    expect(res.mode).toBe("real");
    res = resolveMode({ searchParams: new URLSearchParams("?demo=test") });
    expect(res.mode).toBe("demo");
    clearModeOverride();
    res = resolveMode({ searchParams: new URLSearchParams() });
    expect(res.mode).toBe("real");
  });

  it("domain runtime and surface portability return valid data", async () => {
    const { getDomainRuntimeStatuses } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const domains = await getDomainRuntimeStatuses();
    const capabilities = await getSurfacePortability();
    expect(domains.length).toBeGreaterThan(0);
    expect(capabilities.length).toBeGreaterThan(0);
  });

  it("security index includes all critical checks", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();
    expect(result.score).toBe(100);
    expect(result.checks.length).toBe(11);
  });

  it("seed bootstrap exports correctly", async () => {
    const mod = await import("@/lib/seed/index");
    expect(typeof mod.bootstrapSitaOS).toBe("function");
    expect(typeof mod.seedEcosystemData).toBe("function");
    expect(typeof mod.initializeDataFlows).toBe("function");
  });
});
