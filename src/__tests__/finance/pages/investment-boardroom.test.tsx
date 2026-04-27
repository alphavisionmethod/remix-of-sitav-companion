// Phase 5 — page-state honesty: InvestmentBoardroom
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import InvestmentBoardroom from "@/modules/finance/pages/investment-office/InvestmentBoardroom";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — InvestmentBoardroom (Phase 5)", () => {
  it("mounts under empty decisions and renders boardroom shell", () => {
    const { container } = renderFinancePage(<InvestmentBoardroom />);
    expectHonestStateSignal(container, /Boardroom|Decision|Investment|No decisions|animate-pulse/i);
  });
});
