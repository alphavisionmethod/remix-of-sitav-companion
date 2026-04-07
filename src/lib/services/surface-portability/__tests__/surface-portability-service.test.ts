// ═══════════════════════════════════════════════════════════════
// SITA OS — Unit Tests: Surface Portability Service
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: { message: "table not found" } }) }),
      upsert: () => ({ error: null }),
    }),
  },
}));

describe("Surface Portability Service", () => {
  it("returns 30 canonical capabilities on fallback", async () => {
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const caps = await getSurfacePortability();
    expect(caps.length).toBe(30);
  });

  it("all canonical capabilities score 100", async () => {
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const caps = await getSurfacePortability();
    for (const c of caps) {
      expect(c.portability_score).toBe(100);
      expect(c.web_ready).toBe(true);
      expect(c.mobile_ready).toBe(true);
      expect(c.desktop_ready).toBe(true);
      expect(c.tablet_ready).toBe(true);
      expect(c.watch_ready).toBe(true);
      expect(c.response_envelope_neutral).toBe(true);
      expect(c.surface_adapter_exists).toBe(true);
    }
  });

  it("index returns 100 for all-100 capabilities", async () => {
    const { getSurfacePortabilityIndex } = await import("@/lib/services/surface-portability/surface-portability-service");
    const records = [{ portability_score: 100 }, { portability_score: 100 }] as unknown[];
    expect(getSurfacePortabilityIndex(records)).toBe(100);
  });

  it("each capability has unique key", async () => {
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const caps = await getSurfacePortability();
    const keys = caps.map(c => c.capability_key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("adapter summary shows 7 total adapters", async () => {
    const { getSurfaceAdapterSummary } = await import("@/lib/services/surface-portability/surface-portability-service");
    const summary = getSurfaceAdapterSummary();
    expect(summary.totalAdapters).toBe(7);
    expect(summary.activeAdapters).toBe(3);
    expect(summary.plannedAdapters).toBe(4);
  });
});

describe("Surface Adapter Registry", () => {
  it("has exactly 7 adapters with full grammars", async () => {
    const { SURFACE_ADAPTER_REGISTRY } = await import("@/lib/services/surface-portability/surface-adapter-registry");
    expect(SURFACE_ADAPTER_REGISTRY).toHaveLength(7);
    for (const a of SURFACE_ADAPTER_REGISTRY) {
      expect(a.navigation).toBeDefined();
      expect(a.interaction).toBeDefined();
      expect(a.notification).toBeDefined();
      expect(a.trust).toBeDefined();
      expect(a.receipt).toBeDefined();
      expect(a.performanceBudget).toBeDefined();
    }
  });

  it("includes desktop_electron adapter", async () => {
    const { getAdapterByKey } = await import("@/lib/services/surface-portability/surface-adapter-registry");
    const electron = getAdapterByKey("desktop_electron");
    expect(electron).toBeDefined();
    expect(electron!.shellType).toBe("ElectronShell");
  });

  it("has 3 active and 4 planned", async () => {
    const { getAdapterCountSummary } = await import("@/lib/services/surface-portability/surface-adapter-registry");
    const s = getAdapterCountSummary();
    expect(s.active).toBe(3);
    expect(s.planned).toBe(4);
  });
});
