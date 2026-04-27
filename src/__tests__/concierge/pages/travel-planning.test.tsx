// Phase 5 — page-state honesty: TravelPlanning
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import TravelPlanning from "@/modules/concierge/pages/TravelPlanning";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — TravelPlanning (Phase 5)", () => {
  it("renders honest empty PremiumEmptyState with no trips", () => {
    const { container } = renderConciergePage(<TravelPlanning />);
    expectHonestStateSignal(container, /Travel|trip|No trips|Sign in/i);
  });
});
