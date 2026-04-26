// ═══════════════════════════════════════════════════════════════
// Phase 6 — Adaptive Surface Reactivity
// Verifies that the real archetype maps consumed by adaptive
// surfaces actually differ across primaryMode values — i.e. the
// "adaptation" is observable, not cosmetic.
//
// We assert at the data layer (the source the components read from)
// because mounting the full AdaptiveBusinessHome pulls dozens of
// downstream hooks; the data check proves the contract end-to-end
// without flaky DOM assertions.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { computeBusinessProfile } from "@/domains/engines/business-profile-engine";

describe("Phase 6 — adaptive surface reactivity", () => {
  it("computeBusinessProfile yields different primaryMode for different overrides", () => {
    const ecom = computeBusinessProfile({}, { ecommerce: 95 });
    const service = computeBusinessProfile({}, { service: 95 });
    expect(ecom.primaryMode).not.toBe(service.primaryMode);
  });

  it("home widgets differ between archetypes (visible adaptation)", () => {
    const ecom = computeBusinessProfile({}, { ecommerce: 95 });
    const service = computeBusinessProfile({}, { service: 95 });
    expect(JSON.stringify(ecom.homeWidgets)).not.toEqual(
      JSON.stringify(service.homeWidgets),
    );
  });

  it("sidebar / KPI sets differ across archetypes (real branching, not constant)", () => {
    const ecom = computeBusinessProfile({}, { ecommerce: 95 });
    const service = computeBusinessProfile({}, { service: 95 });
    const ecomSidebar = JSON.stringify(ecom.sidebar);
    const svcSidebar = JSON.stringify(service.sidebar);
    expect(ecomSidebar).not.toEqual(svcSidebar);
    expect(JSON.stringify(ecom.kpis)).not.toEqual(JSON.stringify(service.kpis));
  });

  it("advisors set is non-empty for every archetype (no silent council collapse)", () => {
    for (const arch of ["ecommerce", "service", "marketplace", "agency"] as const) {
      const profile = computeBusinessProfile({}, { [arch]: 95 } as any);
      expect(profile.advisors.length).toBeGreaterThan(0);
    }
  });
});