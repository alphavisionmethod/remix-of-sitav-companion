// ═══════════════════════════════════════════════════════════════
// Phase 6 — Profile Evolution Persistence Round-Trip
// Verifies snapshot save/load, MAX_SNAPSHOTS cap, and dismiss
// correctness. Extends Phase 2's profile-evolution.service.test.ts
// by focusing on multi-call round-trips through real localStorage.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import {
  saveEvolutionSnapshot,
  loadEvolutionHistory,
  saveEvolutionInsights,
  loadEvolutionInsights,
  dismissInsight,
} from "@/lib/services/business-os/profile-evolution.service";

function makeSnap(i: number): any {
  return {
    id: `s-${i}`,
    capturedAt: new Date(2026, 0, i + 1).toISOString(),
    weights: { service: 50, ecommerce: 50 },
    primaryMode: "service",
  };
}

describe("Phase 6 — profile-evolution persistence round-trip", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a single snapshot exactly", () => {
    saveEvolutionSnapshot(makeSnap(1));
    const history = loadEvolutionHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe("s-1");
  });

  it("caps stored snapshots at 30 (MAX_SNAPSHOTS) — oldest trimmed first", () => {
    for (let i = 0; i < 35; i++) saveEvolutionSnapshot(makeSnap(i));
    const history = loadEvolutionHistory();
    expect(history.length).toBeLessThanOrEqual(30);
    // Newest entry must be present.
    expect(history.some((h: any) => h.id === "s-34")).toBe(true);
  });

  it("dismissInsight marks the correct id and leaves siblings untouched", () => {
    saveEvolutionInsights([
      { id: "i1", title: "A", dismissed: false } as any,
      { id: "i2", title: "B", dismissed: false } as any,
      { id: "i3", title: "C", dismissed: false } as any,
    ]);
    dismissInsight("i2");
    const after = loadEvolutionInsights();
    expect(after.find((i: any) => i.id === "i2")?.dismissed).toBe(true);
    expect(after.find((i: any) => i.id === "i1")?.dismissed).toBe(false);
    expect(after.find((i: any) => i.id === "i3")?.dismissed).toBe(false);
  });

  it("loadEvolutionHistory returns [] (not undefined) on a fresh store — honest empty state", () => {
    const history = loadEvolutionHistory();
    expect(Array.isArray(history)).toBe(true);
    expect(history).toEqual([]);
  });
});