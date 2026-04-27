import { describe, it, expect } from "vitest";
import {
  buildRegimeHistory,
  shouldAdjustPosture,
} from "@/lib/services/finance-os/regime-engine.service";

describe("regime-engine.service", () => {
  it("builds a history with current regime and average duration", () => {
    const hist = buildRegimeHistory();
    expect(hist.regimes.length).toBeGreaterThan(0);
    expect(hist.currentRegime.currentRegime).toBeDefined();
    expect(hist.avgRegimeDurationDays).toBeGreaterThan(0);
  });

  it("shouldAdjustPosture flags low-confidence regimes", () => {
    const r = { confidence: 30, currentRegime: "risk-on" } as never;
    const out = shouldAdjustPosture(r);
    expect(out.adjust).toBe(true);
    expect(out.reason).toMatch(/confidence/);
  });

  it("shouldAdjustPosture flags risk-off regimes", () => {
    const r = { confidence: 90, currentRegime: "risk-off" } as never;
    const out = shouldAdjustPosture(r);
    expect(out.adjust).toBe(true);
    expect(out.reason).toMatch(/defensive/i);
  });

  it("shouldAdjustPosture leaves balanced posture alone for high-confidence risk-on", () => {
    const r = { confidence: 85, currentRegime: "risk-on" } as never;
    const out = shouldAdjustPosture(r);
    expect(out.adjust).toBe(false);
  });
});