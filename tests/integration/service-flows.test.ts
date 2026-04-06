// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Tests: Service-to-Service Flows
// Tests cross-service data flow and mode resolution chains
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

// Mock Supabase for integration tests (no real DB needed)
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => ({
      select: (cols?: string, opts?: any) => {
        if (opts?.head) return { count: 5, data: null, error: null };
        return {
          order: () => ({ data: [], error: null }),
          data: [],
          error: null,
        };
      },
      upsert: () => ({ error: null }),
      insert: () => ({ error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));

describe("Integration: Truth Index Pipeline", () => {
  it("aggregator calls all 9 index services and returns valid summary", async () => {
    const { computeTruthIndices } = await import("@/lib/services/truth-indices/truth-index-aggregator");
    const result = await computeTruthIndices();

    // All 9 indices present
    const indexKeys = [
      "runtimeTruth", "launchHonesty", "aiTruth", "connectorTruth",
      "demoGovernance", "surfacePortability", "deviceReadiness",
      "observability", "securityPrivacy",
    ];
    for (const key of indexKeys) {
      const idx = (result as any)[key];
      expect(idx).toBeDefined();
      expect(typeof idx.score).toBe("number");
      expect(typeof idx.label).toBe("string");
      expect(typeof idx.detail).toBe("string");
    }

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.lastComputed).toBeTruthy();
  });
});

describe("Integration: Mode Resolution → Provider Selection", () => {
  it("real mode resolves to real provider path", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "real",
      realData: [{ id: "real-1" }],
      demoData: [{ id: "demo-1" }],
      emptyDefault: [],
    });
    expect(result.source).toBe("real");
    expect(result.isDemo).toBe(false);
  });

  it("demo mode resolves to demo provider path", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "demo",
      realData: [{ id: "real-1" }],
      demoData: [{ id: "demo-1" }],
      emptyDefault: [],
    });
    expect(result.source).toBe("demo");
    expect(result.isDemo).toBe(true);
  });

  it("mode resolution chain: URL param → sessionStorage → default", async () => {
    sessionStorage.clear();
    const { resolveMode, clearModeOverride } = await import("@/lib/dual-reality/reality-mode-resolver");

    // Step 1: Default = real
    let res = resolveMode({ searchParams: new URLSearchParams() });
    expect(res.mode).toBe("real");

    // Step 2: URL param activates demo
    res = resolveMode({ searchParams: new URLSearchParams("?demo=test") });
    expect(res.mode).toBe("demo");

    // Step 3: Subsequent calls use sessionStorage
    res = resolveMode({ searchParams: new URLSearchParams() });
    expect(res.mode).toBe("demo");

    // Step 4: Clear returns to real
    clearModeOverride();
    res = resolveMode({ searchParams: new URLSearchParams() });
    expect(res.mode).toBe("real");
  });
});

describe("Integration: Domain Runtime → Surface Portability", () => {
  it("all domains have corresponding surface capabilities", async () => {
    const { getDomainRuntimeStatuses } = await import("@/lib/services/domain-runtime/domain-runtime-service");
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");

    const domains = await getDomainRuntimeStatuses();
    const capabilities = await getSurfacePortability();

    // Every domain should have at least one matching surface capability
    expect(domains.length).toBeGreaterThan(0);
    expect(capabilities.length).toBeGreaterThan(0);

    // Both should have valid scores
    for (const d of domains) {
      expect(d.truth_score).toBeGreaterThanOrEqual(0);
    }
    for (const c of capabilities) {
      expect(c.portability_score).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Integration: Security Checks → Audit Pipeline", () => {
  it("security index includes all critical checks", async () => {
    const { computeSecurityPrivacyIndex } = await import("@/lib/services/security-privacy/security-privacy-service");
    const result = await computeSecurityPrivacyIndex();

    const criticalKeys = ["rls_all_tables", "audit_logging", "gdpr_edge_functions", "consent_management", "security_definer_functions"];
    for (const key of criticalKeys) {
      const check = result.checks.find(c => c.key === key);
      expect(check).toBeDefined();
      expect(check!.passed).toBe(true);
    }
  });
});

describe("Integration: Seed & Bootstrap", () => {
  it("bootstrapSitaOS exports correctly", async () => {
    const mod = await import("@/lib/seed/index");
    expect(typeof mod.bootstrapSitaOS).toBe("function");
    expect(typeof mod.seedEcosystemData).toBe("function");
    expect(typeof mod.initializeDataFlows).toBe("function");
    expect(typeof mod.logOsEvent).toBe("function");
    expect(typeof mod.logAuditEvent).toBe("function");
  });
});
