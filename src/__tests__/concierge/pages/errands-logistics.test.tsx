// Phase 5 — page-state honesty: ErrandsLogistics
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import ErrandsLogistics from "@/modules/concierge/pages/ErrandsLogistics";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — ErrandsLogistics (Phase 5)", () => {
  it("renders skeleton during loading or empty errands state", () => {
    const { container } = renderConciergePage(<ErrandsLogistics />);
    expectHonestStateSignal(container, /Errands|Logistics|No errands|animate-pulse/i);
  });
});
