// Phase 5 — page-state honesty: PortfolioOffice
import { describe, it, expect } from "vitest";
import { renderFinancePage } from "@/__tests__/finance/_helpers/render-finance-page";
import PortfolioOffice from "@/modules/finance/pages/investment-office/PortfolioOffice";
import { expectHonestStateSignal } from "./_shared";

describe("Finance page — PortfolioOffice (Phase 5)", () => {
  it("mounts under empty positions and renders portfolio shell", () => {
    const { container } = renderFinancePage(<PortfolioOffice />);
    expectHonestStateSignal(container, /Portfolio|Position|No positions|animate-pulse/i);
  });
});
