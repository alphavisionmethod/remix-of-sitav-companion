/**
 * Phase 3 — Household ↔ Business bridge contract.
 *
 * Verifies the canonical bridge service exists, exports the expected
 * surface, and the CrossModule integration map declares both
 * concierge → business pairs. Pure structural test — no DB I/O.
 */
import { describe, it, expect } from "vitest";
import * as bridge from "@/lib/services/concierge/household-business-bridge.service";
import {
  CROSS_MODULE_INTEGRATIONS,
  getIntegration,
} from "@/platform/integration/cross-module-integration-map";

describe("Phase 3 — Household ↔ Business bridge", () => {
  it("exposes the canonical bridge surface", () => {
    expect(typeof bridge.findHouseholdLinksForCrm).toBe("function");
    expect(typeof bridge.findCrmLinksForConciergeEntity).toBe("function");
    expect(typeof bridge.linkConciergeToCrm).toBe("function");
    expect(typeof bridge.unlinkConciergeFromCrm).toBe("function");
    expect(typeof bridge.loadConciergeSurfaceForCrm).toBe("function");
  });

  it("registers both concierge → business integration pairs", () => {
    const household = getIntegration("concierge-to-business-household-contact");
    const provider = getIntegration("concierge-to-business-provider-contact");
    expect(household).toBeDefined();
    expect(provider).toBeDefined();
    expect(household?.bidirectional).toBe(true);
    expect(provider?.bidirectional).toBe(true);
    expect(household?.ownerService).toContain("household-business-bridge.service");
    expect(provider?.ownerService).toContain("household-business-bridge.service");
  });

  it("rejects link calls without any CRM endpoint", async () => {
    await expect(
      bridge.linkConciergeToCrm({
        concierge_entity_type: "household_task",
        concierge_entity_id: "00000000-0000-0000-0000-000000000000",
      }),
    ).rejects.toThrow(/at least one of/i);
  });

  it("guarantees the integration map references owning service paths", () => {
    for (const integration of CROSS_MODULE_INTEGRATIONS) {
      expect(integration.ownerService).toMatch(/^src\//);
    }
  });
});