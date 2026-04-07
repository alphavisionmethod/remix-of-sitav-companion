import { describe, it, expect } from "vitest";
import { validateManifest, type PackManifest } from "@/packages/pack-manifests";
import { filterEntries, type StoreEntry } from "@/packages/store-metadata";

describe("Pack Store System", () => {
  describe("Manifest Validation", () => {
    const validManifest: PackManifest = {
      id: "pack-test", name: "Test Pack", version: "2.1.0", description: "A test pack",
      category: "founders", author: "SITA", icon: "🧪", capabilities: ["cap1", "cap2"],
      dependencies: [], requiredTier: "starter",
      installConfig: { autoActivate: true, requiredConnectors: [], requiredPermissions: ["read"], setupSteps: [] },
      surfaces: ["dashboard" as unknown],
    };

    it("accepts valid manifests", () => {
      expect(validateManifest(validManifest)).toEqual([]);
    });

    it("validates manifest fields", () => {
      const errors = validateManifest({ ...validManifest, version: "bad" } as PackManifest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("rejects invalid version format", () => {
      const errors = validateManifest({ ...validManifest, version: "bad" } as PackManifest);
      expect(errors.some(e => e.includes("version"))).toBe(true);
    });
  });

  describe("Store Entry Filtering", () => {
    const entries: StoreEntry[] = [
      { id: "s1", packId: "p1", name: "Revenue Autopilot", tagline: "Auto-revenue", description: "", category: "founders", tags: ["revenue"], rating: 4.8, installCount: 500, price: 0, featured: true, screenshots: [], changelog: [], reviews: [], publishedAt: Date.now(), updatedAt: Date.now() },
      { id: "s2", packId: "p2", name: "Family Calendar", tagline: "Sync family", description: "", category: "families", tags: ["calendar"], rating: 4.2, installCount: 200, price: 19, featured: false, screenshots: [], changelog: [], reviews: [], publishedAt: Date.now() - 86400000, updatedAt: Date.now() },
      { id: "s3", packId: "p3", name: "Cash Optimizer", tagline: "Save money", description: "", category: "finance", tags: ["money"], rating: 4.6, installCount: 350, price: 0, featured: true, screenshots: [], changelog: [], reviews: [], publishedAt: Date.now() - 3600000, updatedAt: Date.now() },
    ];

    it("filters by category", () => {
      expect(filterEntries(entries, { category: "founders" })).toHaveLength(1);
    });

    it("filters featured only", () => {
      expect(filterEntries(entries, { featured: true })).toHaveLength(2);
    });

    it("sorts by rating descending", () => {
      const sorted = filterEntries(entries, { sortBy: "rating" });
      expect(sorted[0].name).toBe("Revenue Autopilot");
    });

    it("sorts by popularity", () => {
      const sorted = filterEntries(entries, { sortBy: "popular" });
      expect(sorted[0].installCount).toBe(500);
    });
  });
});
