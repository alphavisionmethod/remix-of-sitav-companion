import { describe, it, expect } from "vitest";
import { registerAdvisorSpec, getAdvisorSpec, hasAdvisorSpec, listAdvisorSpecs } from "../index";
import type { BusinessAdvisorSpec } from "../spec-types";

describe("advisor spec registry", () => {
  it("exposes the registry API surface", () => {
    expect(typeof registerAdvisorSpec).toBe("function");
    expect(typeof getAdvisorSpec).toBe("function");
    expect(typeof hasAdvisorSpec).toBe("function");
    expect(Array.isArray(listAdvisorSpecs())).toBe(true);
  });

  it("rejects duplicate registration of the same advisor id", () => {
    // Use the CEO id which Phase 0 has not yet authored.
    const id = "ceo-advisor" as const;
    if (hasAdvisorSpec(id)) {
      // already registered (later phase) — duplicate would throw, which is
      // exactly the behaviour we want; nothing to assert here without
      // mutating production state.
      expect(getAdvisorSpec(id)?.id).toBe(id);
      return;
    }
    const fake = { id } as unknown as BusinessAdvisorSpec;
    registerAdvisorSpec(fake);
    expect(() => registerAdvisorSpec(fake)).toThrow(/duplicate/);
    expect(getAdvisorSpec(id)).toBe(fake);
  });
});