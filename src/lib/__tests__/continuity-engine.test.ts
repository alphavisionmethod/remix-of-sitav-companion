import { describe, it, expect } from "vitest";
import { calculateEmotionalLoad, detectRhythms, generateSuggestions } from "../continuity-engine";

describe("ContinuityEngine", () => {
  describe("calculateEmotionalLoad", () => {
    it("returns low for minimal inputs", () => {
      const result = calculateEmotionalLoad(1, 0, 0, 0);
      expect(result.level).toBe("low");
      expect(result.overall).toBeLessThanOrEqual(25);
    });

    it("returns moderate for moderate inputs", () => {
      const result = calculateEmotionalLoad(2, 1, 0, 1);
      expect(result.level).toBe("moderate");
    });

    it("returns high for heavy inputs", () => {
      const result = calculateEmotionalLoad(3, 2, 1, 2);
      expect(result.level).toBe("high");
    });

    it("returns critical for overloaded inputs", () => {
      const result = calculateEmotionalLoad(10, 5, 5, 5);
      expect(result.level).toBe("critical");
    });

    it("caps overall at 100", () => {
      const result = calculateEmotionalLoad(100, 100, 100, 100);
      expect(result.overall).toBe(100);
    });

    it("includes 4 load factors", () => {
      const result = calculateEmotionalLoad(3, 2, 1, 1);
      expect(result.factors.length).toBe(4);
    });

    it("provides recommendation for each level", () => {
      const low = calculateEmotionalLoad(0, 0, 0, 0);
      const critical = calculateEmotionalLoad(10, 5, 5, 5);
      expect(low.recommendation).toContain("smoothly");
      expect(critical.recommendation).toContain("triage");
    });
  });

  describe("detectRhythms", () => {
    it("returns rhythm patterns", () => {
      const rhythms = detectRhythms();
      expect(rhythms.length).toBeGreaterThan(0);
      expect(rhythms[0]).toHaveProperty("id");
      expect(rhythms[0]).toHaveProperty("name");
      expect(rhythms[0]).toHaveProperty("confidence");
    });
  });

  describe("generateSuggestions", () => {
    it("returns proactive suggestions", () => {
      const load = calculateEmotionalLoad(3, 1, 1, 1);
      const suggestions = generateSuggestions(load);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty("title");
      expect(suggestions[0]).toHaveProperty("impact");
    });
  });
});
