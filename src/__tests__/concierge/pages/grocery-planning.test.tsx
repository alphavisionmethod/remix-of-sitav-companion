// Phase 5 — page-state honesty: GroceryPlanning
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import GroceryPlanning from "@/modules/concierge/pages/GroceryPlanning";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — GroceryPlanning (Phase 5)", () => {
  it("renders honest empty ConciergeEmptyState with no lists", () => {
    const { container } = renderConciergePage(<GroceryPlanning />);
    expectHonestStateSignal(container, /Grocery|grocery|No grocery|Add/i);
  });
});
