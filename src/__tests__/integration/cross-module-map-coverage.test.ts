// Cross-Module Integration Map — coverage ratchet.
//
// Guarantees that the canonical map in
// `src/platform/integration/cross-module-integration-map.ts` covers
// every integration pair this project commits to deepening. Every
// later phase (2..8) of the Cross-Module Integration Deepening
// project depends on this map being complete.

import { describe, expect, it } from "vitest";
import {
  CROSS_MODULE_INTEGRATIONS,
  CROSS_MODULE_INTEGRATION_IDS,
  type CrossModuleIntegration,
} from "@/platform/integration/cross-module-integration-map";

const REQUIRED_IDS = [
  "crm-to-finance-contact-customer",
  "crm-to-finance-company-customer",
  "crm-to-concierge-contact-appointment",
  "concierge-to-business-household-contact",
  "concierge-to-business-provider-contact",
  "background-task-to-source",
  "background-task-to-result",
  "advisor-to-operational-outcome",
  "recovered-value-to-finance",
  "adaptive-signal-bus",
  "readiness-to-interruption-policy",
] as const;

describe("cross-module integration map", () => {
  it("covers every required integration pair", () => {
    for (const id of REQUIRED_IDS) {
      expect(CROSS_MODULE_INTEGRATION_IDS).toContain(id);
    }
  });

  it("declares ownerService for every entry", () => {
    for (const e of CROSS_MODULE_INTEGRATIONS) {
      expect(e.ownerService, `entry ${e.id} missing ownerService`).toMatch(/^src\//);
    }
  });

  it("declares forwardRoute and forwardHandoff for every entry", () => {
    for (const e of CROSS_MODULE_INTEGRATIONS) {
      expect(e.forwardRoute, `entry ${e.id} missing forwardRoute`).toBeTruthy();
      expect(e.forwardHandoff, `entry ${e.id} missing forwardHandoff`).toBeTruthy();
    }
  });

  it("requires a oneWayRationale when bidirectional is false", () => {
    for (const e of CROSS_MODULE_INTEGRATIONS) {
      if (!e.bidirectional) {
        expect(
          e.oneWayRationale,
          `entry ${e.id} is one-way and must declare oneWayRationale`,
        ).toBeTruthy();
        expect(e.reverseRoute).toBeNull();
      } else {
        expect(
          e.reverseRoute,
          `entry ${e.id} is bidirectional and must declare reverseRoute`,
        ).toBeTruthy();
      }
    }
  });

  it("declares a proofCarrier for every entry", () => {
    for (const e of CROSS_MODULE_INTEGRATIONS) {
      expect(e.proofCarrier, `entry ${e.id} missing proofCarrier`).toBeTruthy();
    }
  });

  it("has unique ids", () => {
    const seen = new Set<string>();
    for (const e of CROSS_MODULE_INTEGRATIONS as readonly CrossModuleIntegration[]) {
      expect(seen.has(e.id), `duplicate integration id: ${e.id}`).toBe(false);
      seen.add(e.id);
    }
  });
});