import { describe, it, expect, beforeEach } from "vitest";
import {
  saveEvolutionSnapshot,
  loadEvolutionHistory,
  saveEvolutionInsights,
  loadEvolutionInsights,
  dismissInsight,
} from "@/lib/services/business-os/profile-evolution.service";
import type {
  EvolutionSnapshot,
  EvolutionInsight,
} from "@/domains/engines/profile-evolution-engine";

function snap(i: number): EvolutionSnapshot {
  return {
    capturedAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
    signalSummary: {} as EvolutionSnapshot["signalSummary"],
    derivedWeightDelta: { service: i },
  };
}

function insight(id: string): EvolutionInsight {
  return {
    id,
    title: `Insight ${id}`,
    body: "...",
    severity: "info",
    detectedAt: new Date().toISOString(),
    dismissed: false,
  } as unknown as EvolutionInsight;
}

describe("profile-evolution.service", () => {
  beforeEach(() => localStorage.clear());

  it("saves and loads a snapshot", () => {
    saveEvolutionSnapshot(snap(0));
    expect(loadEvolutionHistory()).toHaveLength(1);
  });

  it("appends multiple snapshots", () => {
    for (let i = 0; i < 5; i++) saveEvolutionSnapshot(snap(i));
    expect(loadEvolutionHistory()).toHaveLength(5);
  });

  it("trims to MAX_SNAPSHOTS=30 (oldest dropped)", () => {
    for (let i = 0; i < 35; i++) saveEvolutionSnapshot(snap(i));
    const history = loadEvolutionHistory();
    expect(history).toHaveLength(30);
    // oldest 5 dropped: deltas 0-4 gone, 5-34 remain
    expect(history[0].derivedWeightDelta.service).toBe(5);
    expect(history[29].derivedWeightDelta.service).toBe(34);
  });

  it("loadEvolutionHistory returns [] when storage empty", () => {
    expect(loadEvolutionHistory()).toEqual([]);
  });

  it("dismissInsight flips only the matching id", () => {
    saveEvolutionInsights([insight("a"), insight("b"), insight("c")]);
    dismissInsight("b");
    const after = loadEvolutionInsights();
    expect(after.find(i => i.id === "a")?.dismissed).toBe(false);
    expect(after.find(i => i.id === "b")?.dismissed).toBe(true);
    expect(after.find(i => i.id === "c")?.dismissed).toBe(false);
  });

  it("survives corrupted payloads", () => {
    localStorage.setItem("sita-profile-evolution", "{nope");
    expect(loadEvolutionHistory()).toEqual([]);
  });
});
