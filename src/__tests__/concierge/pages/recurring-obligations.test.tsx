// Phase 5 — page-state honesty: RecurringObligations
import { describe, it, expect } from "vitest";
import { renderConciergePage } from "@/__tests__/concierge/_helpers/render-concierge-page";
import RecurringObligations from "@/modules/concierge/pages/RecurringObligations";
import { expectHonestStateSignal } from "./_shared";

describe("Concierge page — RecurringObligations (Phase 5)", () => {
  it("renders honest empty PremiumEmptyState with empty backend", () => {
    const { container } = renderConciergePage(<RecurringObligations />);
    expectHonestStateSignal(container, /Recurring|No recurring obligations|Sign in/i);
  });
});
