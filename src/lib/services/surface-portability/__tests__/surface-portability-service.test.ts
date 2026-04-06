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
  it("returns 25 canonical capabilities on fallback", async () => {
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const caps = await getSurfacePortability();
    expect(caps.length).toBe(25);
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
    const records = [
      { portability_score: 100 },
      { portability_score: 100 },
    ] as any[];
    expect(getSurfacePortabilityIndex(records)).toBe(100);
  });

  it("index averages mixed scores correctly", async () => {
    const { getSurfacePortabilityIndex } = await import("@/lib/services/surface-portability/surface-portability-service");
    const records = [
      { portability_score: 80 },
      { portability_score: 60 },
    ] as any[];
    expect(getSurfacePortabilityIndex(records)).toBe(70);
  });

  it("each capability has unique key", async () => {
    const { getSurfacePortability } = await import("@/lib/services/surface-portability/surface-portability-service");
    const caps = await getSurfacePortability();
    const keys = caps.map(c => c.capability_key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
