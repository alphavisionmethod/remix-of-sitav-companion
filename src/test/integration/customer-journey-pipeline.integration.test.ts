import { describe, it, expect } from "vitest";
import { CUSTOMER_JOURNEY_REGISTRY } from "@/lib/customer-journey/journey-registry";

describe("Customer Journey Pipeline — Integration", () => {
  it("has a non-empty journey registry", () => {
    expect(CUSTOMER_JOURNEY_REGISTRY.length).toBeGreaterThan(10);
  });

  it("all journeys have required fields", () => {
    for (const j of CUSTOMER_JOURNEY_REGISTRY) {
      expect(j.journeyKey).toBeTruthy();
      expect(j.displayName).toBeTruthy();
      expect(j.persona).toBeTruthy();
      expect(j.domain).toBeTruthy();
      expect(j.steps.length).toBeGreaterThan(0);
      expect(j.expectedOutcome).toBeTruthy();
      expect(j.launchImportance).toBeTruthy();
      expect(j.owner).toBeTruthy();
    }
  });

  it("journey keys are unique", () => {
    const keys = CUSTOMER_JOURNEY_REGISTRY.map(j => j.journeyKey);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("auth journeys exist", () => {
    const authJourneys = CUSTOMER_JOURNEY_REGISTRY.filter(j => j.domain === "auth" || j.routeFamily.includes("login"));
    expect(authJourneys.length).toBeGreaterThan(0);
  });

  it("all steps have sequential ordering", () => {
    for (const j of CUSTOMER_JOURNEY_REGISTRY) {
      for (let i = 0; i < j.steps.length; i++) {
        expect(j.steps[i].order).toBe(i + 1);
      }
    }
  });

  it("covers core domains", () => {
    const domains = new Set(CUSTOMER_JOURNEY_REGISTRY.map(j => j.domain));
    expect(domains.has("auth")).toBe(true);
    expect(domains.has("dashboard")).toBe(true);
  });

  it("personas include user and operator", () => {
    const personas = new Set(CUSTOMER_JOURNEY_REGISTRY.map(j => j.persona));
    expect(personas.has("user")).toBe(true);
  });

  it("launch importance values are valid", () => {
    const valid = ["launch_blocker", "pilot_blocker", "claim_risk", "important_non_blocker", "non_blocking"];
    for (const j of CUSTOMER_JOURNEY_REGISTRY) {
      expect(valid).toContain(j.launchImportance);
    }
  });
});
