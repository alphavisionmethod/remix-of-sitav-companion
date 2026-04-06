// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Tests: Dual Reality Governance
// Tests mode-aware data segregation and governance enforcement
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }), data: [], error: null, count: 0 }),
      upsert: () => ({ error: null }),
      insert: () => ({ error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  },
}));

describe("Integration: Dual Reality Exports", () => {
  it("dual-reality barrel exports all required modules", async () => {
    const mod = await import("@/lib/dual-reality/index");

    // Mode registry
    expect(mod.REALITY_MODES).toBeDefined();

    // Mode resolver
    expect(typeof mod.resolveMode).toBe("function");
    expect(typeof mod.setModeOverride).toBe("function");
    expect(typeof mod.clearModeOverride).toBe("function");
    expect(typeof mod.persistResolution).toBe("function");

    // Context
    expect(typeof mod.RealityModeProvider).toBe("function");
    expect(typeof mod.useRealityMode).toBe("function");
    expect(typeof mod.useRealityModeSafe).toBe("function");

    // Provider registry
    expect(typeof mod.getAllProviders).toBe("function");
    expect(typeof mod.getProvidersByCategory).toBe("function");
    expect(typeof mod.getProvidersForDomain).toBe("function");
  });
});

describe("Integration: Mode-Aware Provider Resolution", () => {
  it("resolveByMode never returns demo data in real mode", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");

    // Real mode with data
    const r1 = resolveByMode({ mode: "real", realData: [1], demoData: [2], emptyDefault: [] });
    expect(r1.source).toBe("real");
    expect(r1.data).toEqual([1]);

    // Real mode without data
    const r2 = resolveByMode({ mode: "real", realData: null, demoData: [2], emptyDefault: [] });
    expect(r2.source).toBe("empty");
    expect(r2.data).toEqual([]);

    // NEVER falls back to demo in real mode
    expect(r2.data).not.toEqual([2]);
  });

  it("demo mode always uses demo data regardless of real data", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");

    const result = resolveByMode({ mode: "demo", realData: [1], demoData: [2], emptyDefault: [] });
    expect(result.source).toBe("demo");
    expect(result.data).toEqual([2]);
  });

  it("dev_demo mode treated as demo", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({ mode: "dev_demo", realData: null, demoData: [3], emptyDefault: [] });
    expect(result.isDemo).toBe(true);
    expect(result.source).toBe("demo");
  });
});

describe("Integration: Reality Mode Registry", () => {
  it("REALITY_MODES contains required modes", async () => {
    const { REALITY_MODES } = await import("@/lib/dual-reality/reality-mode-registry");
    const keys = Object.keys(REALITY_MODES);
    expect(keys).toContain("real");
    expect(keys).toContain("demo");
  });

  it("each mode has required properties", async () => {
    const { REALITY_MODES } = await import("@/lib/dual-reality/reality-mode-registry");
    for (const [key, mode] of Object.entries(REALITY_MODES)) {
      expect(mode).toHaveProperty("key");
      expect(mode).toHaveProperty("label");
    }
  });
});
