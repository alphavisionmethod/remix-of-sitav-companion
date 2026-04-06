import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: (...args: any[]) => {
        const hasHead = args[1]?.head;
        if (hasHead) return Promise.resolve({ count: 0, data: null, error: null });
        return { order: () => Promise.resolve({ data: [], error: null }) };
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

describe("Integration: Dual Reality Exports", () => {
  it("dual-reality barrel exports resolver functions", async () => {
    const mod = await import("@/lib/dual-reality/index");
    expect(typeof mod.resolveMode).toBe("function");
    expect(typeof mod.setModeOverride).toBe("function");
    expect(typeof mod.clearModeOverride).toBe("function");
    expect(typeof mod.persistResolution).toBe("function");
    expect(typeof mod.getAllProviders).toBe("function");
  });
});

describe("Integration: Mode-Aware Provider Resolution", () => {
  it("resolveByMode never returns demo data in real mode", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const r1 = resolveByMode({ mode: "real", realData: [1], demoData: [2], emptyDefault: [] });
    expect(r1.source).toBe("real");
    const r2 = resolveByMode({ mode: "real", realData: null, demoData: [2], emptyDefault: [] });
    expect(r2.source).toBe("empty");
    expect(r2.data).not.toEqual([2]);
  });

  it("demo mode always uses demo data", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({ mode: "demo", realData: [1], demoData: [2], emptyDefault: [] });
    expect(result.source).toBe("demo");
    expect(result.data).toEqual([2]);
  });

  it("dev_demo mode treated as demo", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({ mode: "dev_demo", realData: null, demoData: [3], emptyDefault: [] });
    expect(result.isDemo).toBe(true);
  });
});

describe("Integration: Reality Mode Registry", () => {
  it("CANONICAL_MODES contains required modes", async () => {
    const { CANONICAL_MODES } = await import("@/lib/dual-reality/reality-mode-registry");
    expect(CANONICAL_MODES).toBeDefined();
    expect(CANONICAL_MODES.real).toBeDefined();
    expect(CANONICAL_MODES.demo).toBeDefined();
    expect(CANONICAL_MODES.real.key).toBe("real");
    expect(CANONICAL_MODES.demo.key).toBe("demo");
  });

  it("each mode has required properties", async () => {
    const { CANONICAL_MODES } = await import("@/lib/dual-reality/reality-mode-registry");
    for (const [key, mode] of Object.entries(CANONICAL_MODES)) {
      expect(mode).toHaveProperty("key");
      expect(mode).toHaveProperty("name");
      expect(mode).toHaveProperty("description");
      expect(mode).toHaveProperty("sideEffects");
    }
  });
});
