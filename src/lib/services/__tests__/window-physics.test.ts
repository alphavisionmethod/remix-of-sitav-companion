import { describe, it, expect } from "vitest";
import {
  computeAlignmentGuides,
  findMagneticEdges,
  applyMagneticSnap,
  applyEdgeBounce,
  trackShake,
  clearShakeState,
  type PhysicsWindow,
} from "../window-physics";

describe("Window Physics", () => {
  const win1: PhysicsWindow = { id: "a", x: 100, y: 100, width: 200, height: 200 };
  const win2: PhysicsWindow = { id: "b", x: 310, y: 100, width: 200, height: 200 };

  describe("findMagneticEdges", () => {
    it("detects nearby edges within magnetic range", () => {
      const close: PhysicsWindow = { id: "b", x: 305, y: 100, width: 200, height: 200 };
      const edges = findMagneticEdges(win1, [close]);
      expect(edges.length).toBeGreaterThan(0);
    });

    it("returns empty for distant windows", () => {
      const far: PhysicsWindow = { id: "b", x: 1000, y: 1000, width: 200, height: 200 };
      const edges = findMagneticEdges(win1, [far]);
      expect(edges.length).toBe(0);
    });

    it("skips self", () => {
      const edges = findMagneticEdges(win1, [win1]);
      expect(edges.length).toBe(0);
    });
  });

  describe("computeAlignmentGuides", () => {
    it("returns guides from magnetic edges", () => {
      const close: PhysicsWindow = { id: "b", x: 305, y: 100, width: 200, height: 200 };
      const edges = findMagneticEdges(win1, [close]);
      const guides = computeAlignmentGuides(win1, [close], edges);
      expect(guides.length).toBeGreaterThan(0);
      for (const g of guides) {
        expect(g).toHaveProperty("axis");
        expect(g).toHaveProperty("position");
        expect(g).toHaveProperty("distance");
        expect(typeof g.distance).toBe("number");
      }
    });

    it("returns empty for no edges", () => {
      const guides = computeAlignmentGuides(win1, [win2], []);
      expect(guides.length).toBe(0);
    });
  });

  describe("applyMagneticSnap", () => {
    it("snaps position toward edge", () => {
      const edges = [{ axis: "x" as const, position: 300, sourceId: "a", targetId: "b" }];
      const result = applyMagneticSnap({ x: 295, y: 100 }, edges);
      expect(result.snapped).toBe(true);
      expect(result.x).toBeGreaterThan(295);
    });

    it("does not snap when far", () => {
      const edges = [{ axis: "x" as const, position: 500, sourceId: "a", targetId: "b" }];
      const result = applyMagneticSnap({ x: 100, y: 100 }, edges);
      expect(result.snapped).toBe(false);
    });
  });

  describe("applyEdgeBounce", () => {
    it("bounces from left edge", () => {
      const result = applyEdgeBounce(
        { x: -10, y: 50 },
        { vx: -5, vy: 0 },
        { width: 100, height: 100 },
        { width: 800, height: 600 }
      );
      expect(result.x).toBe(0);
      expect(result.vx).toBeGreaterThan(0);
      expect(result.bounced).toBe(true);
    });

    it("bounces from right edge", () => {
      const result = applyEdgeBounce(
        { x: 750, y: 50 },
        { vx: 5, vy: 0 },
        { width: 100, height: 100 },
        { width: 800, height: 600 }
      );
      expect(result.x).toBe(700);
      expect(result.bounced).toBe(true);
    });

    it("no bounce when within bounds", () => {
      const result = applyEdgeBounce(
        { x: 100, y: 100 },
        { vx: 2, vy: 2 },
        { width: 100, height: 100 },
        { width: 800, height: 600 }
      );
      expect(result.bounced).toBe(false);
    });
  });

  describe("trackShake", () => {
    it("returns false for single movement", () => {
      clearShakeState("test");
      expect(trackShake("test", 100)).toBe(false);
    });

    it("clearShakeState resets tracking", () => {
      trackShake("test2", 100);
      clearShakeState("test2");
      expect(trackShake("test2", 100)).toBe(false);
    });
  });
});
