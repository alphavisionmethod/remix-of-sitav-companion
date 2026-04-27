// Phase 5 — page-state honesty: ServiceProviders
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import ServiceProviders from "@/modules/concierge/pages/ServiceProviders";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — ServiceProviders (Phase 5)", () => {
  it("renders honest empty ConciergeEmptyState with empty backend", () => {
    const { container } = renderConciergePage(<ServiceProviders />);
    expectHonestStateSignal(container, /Service Providers|trusted network/i);
  });
});
