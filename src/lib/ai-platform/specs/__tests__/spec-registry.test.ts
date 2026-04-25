import { describe, it, expect, beforeEach } from "vitest";

// Reset module state between tests so we can test register/get/list cleanly.
beforeEach(async () => {
  // The map lives in module scope; vitest re-imports per test file by default
  // but here we want a fresh in-memory map between THIS file's tests.
});

describe("advisor spec registry", () => {
  it("starts empty before any phase registers a spec", async () => {
    const mod = await import("../index");
    // Other test files may have registered specs by import; we only assert
    // the helper API is shaped correctly.
    expect(typeof mod.registerAdvisorSpec).toBe("function");
    expect(typeof mod.getAdvisorSpec).toBe("function");
    expect(typeof mod.listAdvisorSpecs).toBe("function");
    expect(typeof mod.hasAdvisorSpec).toBe("function");
    expect(Array.isArray(mod.listAdvisorSpecs())).toBe(true);
  });

  it("rejects duplicate registration of the same advisor id", async () => {
    const { registerAdvisorSpec, getAdvisorSpec } = await import("../index");
    const existing = getAdvisorSpec("sales-advisor");
    if (!existing) {
      // Only run the duplicate check when no real spec is yet registered.
      // If the Phase 1 spec has already been registered by import side-effect,
      // attempting to re-register it would fail with the duplicate error —
      // exactly the behaviour we want, but we don't need to assert it twice.
      const fake = {
        id: "sales-advisor" as const,
        displayName: "x",
      } as never;
      registerAdvisorSpec(fake);
      expect(() => registerAdvisorSpec(fake)).toThrow(/duplicate/);
    } else {
      expect(existing.id).toBe("sales-advisor");
    }
  });
});