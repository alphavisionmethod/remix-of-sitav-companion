// ═══════════════════════════════════════════════════════════════
// SITA OS — Unit Tests: Dual Reality System
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Reality Mode Resolver", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
  });

  it("defaults to real mode", async () => {
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.mode).toBe("real");
    expect(resolution.source).toBe("environment_default");
  });

  it("activates demo mode from URL param", async () => {
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    const params = new URLSearchParams("?demo=investor_scenario");
    const resolution = resolveMode({ searchParams: params });
    expect(resolution.mode).toBe("demo");
    expect(resolution.source).toBe("demo_token");
    expect(resolution.scenarioKey).toBe("investor_scenario");
  });

  it("persists demo token to sessionStorage", async () => {
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    resolveMode({ searchParams: new URLSearchParams("?demo=test_pack") });
    expect(sessionStorage.getItem("sita-demo-token")).toBe("test_pack");
  });

  it("restores demo from sessionStorage", async () => {
    sessionStorage.setItem("sita-demo-token", "saved_scenario");
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.mode).toBe("demo");
    expect(resolution.scenarioKey).toBe("saved_scenario");
  });

  it("operator override takes priority over demo token", async () => {
    const { setModeOverride, resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    sessionStorage.setItem("sita-demo-token", "some_demo");
    setModeOverride("sandbox" as unknown, { scenarioKey: "admin_test", durationMinutes: 60 });
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.mode).toBe("sandbox");
    expect(resolution.source).toBe("operator_override");
  });

  it("clearModeOverride returns to real", async () => {
    const { setModeOverride, clearModeOverride, resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    setModeOverride("demo", { durationMinutes: 60 });
    clearModeOverride();
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.mode).toBe("real");
  });

  it("expired override is cleaned up", async () => {
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    sessionStorage.setItem("sita-mode-override", JSON.stringify({
      mode: "demo",
      expiresAt: Date.now() - 1000, // Already expired
    }));
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.mode).toBe("real");
    expect(sessionStorage.getItem("sita-mode-override")).toBeNull();
  });

  it("resolution includes timestamp", async () => {
    const { resolveMode } = await import("@/lib/dual-reality/reality-mode-resolver");
    const before = Date.now();
    const resolution = resolveMode({ searchParams: new URLSearchParams() });
    expect(resolution.resolvedAt).toBeGreaterThanOrEqual(before);
    expect(resolution.resolvedAt).toBeLessThanOrEqual(Date.now());
  });
});

describe("Reality Provider Hook", () => {
  it("resolveByMode returns demo data in demo mode", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "demo",
      realData: null,
      demoData: [{ id: 1 }],
      emptyDefault: [],
    });
    expect(result.source).toBe("demo");
    expect(result.isDemo).toBe(true);
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it("resolveByMode returns real data in real mode", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "real",
      realData: [{ id: 2 }],
      demoData: [{ id: 1 }],
      emptyDefault: [],
    });
    expect(result.source).toBe("real");
    expect(result.isDemo).toBe(false);
    expect(result.data).toEqual([{ id: 2 }]);
  });

  it("resolveByMode returns empty default when no real data", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "real",
      realData: null,
      demoData: [{ id: 1 }],
      emptyDefault: [],
    });
    expect(result.source).toBe("empty");
    expect(result.isDemo).toBe(false);
    expect(result.data).toEqual([]);
  });

  it("resolveByMode treats empty array as empty state", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "real",
      realData: [],
      demoData: [{ id: 1 }],
      emptyDefault: [],
    });
    expect(result.source).toBe("empty");
  });

  it("sandbox mode is treated as demo", async () => {
    const { resolveByMode } = await import("@/lib/hooks/useRealityProvider");
    const result = resolveByMode({
      mode: "sandbox",
      realData: null,
      demoData: [{ id: 1 }],
      emptyDefault: [],
    });
    expect(result.isDemo).toBe(true);
    expect(result.source).toBe("demo");
  });
});
