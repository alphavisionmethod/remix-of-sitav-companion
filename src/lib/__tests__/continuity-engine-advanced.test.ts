import { describe, it, expect } from "vitest";
import {
  calculateEmotionalLoad,
  detectRhythms,
  generateSuggestions,
  getContinuitySnapshot,
} from "@/lib/continuity-engine";

describe("Continuity Engine — calculateEmotionalLoad", () => {
  it("returns low load for minimal activity", () => {
    const result = calculateEmotionalLoad(1, 0, 0, 0);
    expect(result.level).toBe("low");
    expect(result.overall).toBeLessThanOrEqual(25);
  });

  it("returns moderate load for moderate activity", () => {
    const result = calculateEmotionalLoad(3, 1, 0, 1);
    expect(result.level).toBe("moderate");
  });

  it("returns critical for extreme load", () => {
    const result = calculateEmotionalLoad(10, 5, 3, 5);
    expect(result.level).toBe("critical");
    expect(result.overall).toBe(100);
  });

  it("caps individual factors", () => {
    const result = calculateEmotionalLoad(100, 0, 0, 0);
    expect(result.factors.find(f => f.category === "Task Density")!.score).toBeLessThanOrEqual(30);
  });

  it("caps overall at 100", () => {
    const result = calculateEmotionalLoad(100, 100, 100, 100);
    expect(result.overall).toBe(100);
  });

  it("provides appropriate recommendation per level", () => {
    const low = calculateEmotionalLoad(1, 0, 0, 0);
    expect(low.recommendation).toContain("smoothly");
    const critical = calculateEmotionalLoad(10, 5, 3, 5);
    expect(critical.recommendation).toContain("overloaded");
  });

  it("returns 4 factors", () => {
    const result = calculateEmotionalLoad(3, 1, 1, 1);
    expect(result.factors.length).toBe(4);
  });
});

describe("Continuity Engine — detectRhythms", () => {
  it("returns predefined rhythm patterns", () => {
    const rhythms = detectRhythms();
    expect(rhythms.length).toBeGreaterThanOrEqual(3);
    expect(rhythms.every(r => r.confidence > 0)).toBe(true);
    expect(rhythms.every(r => r.id.startsWith("R-"))).toBe(true);
  });
});

describe("Continuity Engine — generateSuggestions", () => {
  it("returns base suggestions for low load", () => {
    const load = calculateEmotionalLoad(1, 0, 0, 0);
    const suggestions = generateSuggestions(load);
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
    expect(suggestions.every(s => s.actionable)).toBe(true);
  });

  it("adds triage mode for critical load", () => {
    const load = calculateEmotionalLoad(10, 5, 3, 5);
    const suggestions = generateSuggestions(load);
    expect(suggestions[0].title).toContain("triage");
    expect(suggestions[0].id).toBe("S-000");
  });

  it("adds triage mode for high load", () => {
    const load = calculateEmotionalLoad(5, 3, 2, 3);
    const suggestions = generateSuggestions(load);
    expect(suggestions[0].title).toContain("triage");
  });
});

describe("Continuity Engine — getContinuitySnapshot", () => {
  it("returns complete snapshot", () => {
    const snapshot = getContinuitySnapshot();
    expect(snapshot.loadScore).toBeDefined();
    expect(snapshot.rhythms.length).toBeGreaterThan(0);
    expect(snapshot.suggestions.length).toBeGreaterThan(0);
    expect(snapshot.weeklyTrend.length).toBe(7);
  });

  it("accepts custom parameters", () => {
    const snapshot = getContinuitySnapshot(1, 0, 0, 0);
    expect(snapshot.loadScore.level).toBe("low");
  });
});
