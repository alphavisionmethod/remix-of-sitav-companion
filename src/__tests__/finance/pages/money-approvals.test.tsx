// Phase 5 — page-state honesty: MoneyApprovals
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import MoneyApprovals from "@/modules/finance/pages/MoneyApprovals";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — MoneyApprovals (Phase 5)", () => {
  it("renders skeleton during load or 'Select an action' empty detail", () => {
    const { container } = renderFinancePage(<MoneyApprovals />);
    expectHonestStateSignal(container, /APPROVAL QUEUE|Select an action|animate-pulse/i);
  });
});
