// Phase 5 — page-state honesty: MoneyOverview
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import MoneyOverview from "@/modules/finance/pages/MoneyOverview";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — MoneyOverview (Phase 5)", () => {
  it("renders PremiumEmptyState 'Set up your financial command center' for empty backend", () => {
    const { container } = renderFinancePage(<MoneyOverview />);
    expectHonestStateSignal(container, /financial command center|Add a Bill|Track Subscription/i);
  });
});
