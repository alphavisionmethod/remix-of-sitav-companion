import { describe, it, expect } from "vitest";

describe("SovereignCalculation", () => {
  it("exports calculation modules", async () => {
    const mod = await import("../index");
    expect(mod).toBeDefined();
    // Should re-export from sub-modules
    expect(Object.keys(mod).length).toBeGreaterThan(0);
  });
});
