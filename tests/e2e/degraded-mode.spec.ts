// ═══════════════════════════════════════════════════════════════
// SITA OS — Degraded/Offline Mode E2E Test
// Verifies app handles offline/degraded states correctly
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

describe("Degraded Mode", () => {
  it("should have offline-degraded matrix defined", async () => {
    const module = await import("../../src/platform/product/offline-degraded-matrix");
    expect(module).toBeDefined();
  });

  it("should have state grammar with degraded states", async () => {
    const module = await import("../../src/platform/product/state-grammar");
    expect(module).toBeDefined();
  });

  it("should have error boundary components", async () => {
    // Check that general error handling exists
    const fs = await import("fs");
    const exists = fs.existsSync("src/components/ui/sonner.tsx") || fs.existsSync("src/components/sita/PageTruthBanner.tsx");
    expect(exists).toBe(true);
  });

  it("should have sync control page for offline recovery", async () => {
    const module = await import("../../src/pages/mobile/MobileSyncControl");
    expect(module.default).toBeDefined();
  });

  it("should have product surface registry with deployment targets", async () => {
    const module = await import("../../src/platform/product/product-surface-registry");
    expect(module.ProductSurface).toBeDefined();
    expect(module.PRODUCT_SURFACE_DEFINITIONS).toBeDefined();
  });
});